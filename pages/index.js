import React, { useState, useEffect } from "react";
// importamos el client de socket.io
import io from "socket.io-client";
// importamos axios
import axios from "axios";
// importamos mensaje de error
import Error from "next/error";

import Head from "next/head";

const Index = ({ messages, status }) => {
  // en el estado guardamos un string vacío (el campo del formulario) y los mensajes que recibimos del API
  const [state, setState] = useState({ field: "", messages, socket: null });

  // una vez que el componente se montó en el navegador nos conectamos al servidor de sockets
  // y empezamos a recibimos el evento `message` del servidor
  useEffect(() => {
    state.socket = io("http://localhost:3000/");
    state.socket.on("message", handleMessage);
    return () => {
      // cuando el componente se va a desmontar es importante que dejemos de escuchar el evento
      // y que cerremos la conexión por sockets, esto es para evitar problemas de que lleguen mensajes
      state.socket.off("message", handleMessage);
      state.socket.close();
    };
  }, []);

  // cuando llega un mensaje del servidor lo agregamos al estado de nuestra página
  const handleMessage = (message) => {
    setState({ ...state, messages: state.messages.concat(message) });
  };

  // cuando el valor del input cambia actualizamos el estado de nuestra página
  const handleChange = (e) => {
    setState({ ...state, field: e.target.value });
  };

  // cuando se envía el formulario enviamos el mensaje al servidor
  const handleSubmit = (e) => {
    e.preventDefault();
    const times = new Date();
    // creamos un objeto message con la fecha actual como ID y el valor del input
    const message = {
      id: times.getTime(),
      datepublish: times.toLocaleTimeString(),
      value: state.field,
    };

    // enviamos el objeto por socket al servidor
    state.socket.emit("message", message);

    // lo agregamos a nuestro estado para que se muestre en pantalla y limpiamos el input
    setState({ ...state, field: "", messages: state.messages.concat(message) });
  };

  if (status !== 200) {
    return <Error status={status} />;
  }
  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;1,100&display=swap"
          rel="stylesheet"
        />
      </Head>
      <main className="container">
        <div className="card-messages">
          <ul className="messages">
            {state.messages.map((message) => (
              <li key={message.id}>
                <small>{message.datepublish}</small>
                <p>{message.value}</p>
              </li>
            ))}
          </ul>
          <form onSubmit={handleSubmit}>
            <input
              onChange={handleChange}
              type="text"
              placeholder="Write here..."
              value={state.field}
              className="form-control"
            />
            <button className="btn-send">Enviar</button>
          </form>
        </div>
        <style jsx global>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: "Montserrat", sans-serif;
          }
          body {
            width: 100%;
            background: #fafafa;
          }
          .container {
            width: 100%;
            height: 100%;
            padding: 2rem;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .card-messages {
            width: 600px;
            margin: auto;
            border-radius: 0.3rem;
            padding: 2rem;
            background: #fff;
            box-shadow: 0 2px 1px rgb(0, 0, 0, 0.1);
          }

          .messages {
            width: 100%;
            padding: 1rem;
            margin-bottom: 0.5rem;
            border: 1px solid #f2f2f2;
            border-radius: 0.3rem;
            min-height: 100px;
            max-height: 200px;
            overflow-y: auto;
            list-style: none;
          }

          .messages li p {
            display: inline-block;
            background: #e6f0ff;
            padding: 0.4rem 1rem;
            border-radius: 10rem;
            color: #035ce6;
            font-size: 0.8rem;
            margin: 0;
            margin-bottom: 1rem;
          }

          .messages li small {
            display: block;
            font-size: 0.6rem;
            color: black;
            font-style: italic;
            margin-left: 0.3rem;
            margin-bottom: 0.3rem;
          }

          .messages li:nth-child(even) p {
            background: #035ce6;
            color: #e6f0ff;
          }

          .form-control {
            height: 35px;
            padding: 0 1rem;
            border-radius: 0.3rem;
            border: none;
            color: #035ce6;
            outline: none;
            border: 1px solid #e6f0ff;
          }

          .form-control::placeholder {
            color: #035ce6;
            opacity: 0.6;
          }

          .form-control:focus {
            border: 1px solid #035ce6;
          }

          .btn-send {
            height: 35px;
            padding: 0 1rem;
            background: #035ce6;
            border: none;
            outline: none;
            color: #fff;
            border-radius: 0.3rem;
            margin-left: 0.4rem;
            cursor: pointer;
          }
        `}</style>
      </main>
    </>
  );
};

// acá pedimos los datos de los mensajes viejos, esto se ejecuta tanto en el cliente como en el servidor.
Index.getInitialProps = async ({ query, res }) => {
  try {
    const response = await axios.get("http://localhost:3000/messages");
    const messages = await response.data;
    return { messages, status: 200 };
  } catch (error) {
    return { messages: null, status: 500 };
  }
};

export default Index;
