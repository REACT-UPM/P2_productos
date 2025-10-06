import {render, fireEvent, waitFor, waitForElementToBeRemoved, screen, act} from '@testing-library/react'
import App from '../../src/App';
import ProductPage from '../../src/ProductPage';
import {mockdata} from "../utils/products.js";
import {mockdata2} from "../utils/products2.js";
import { groq_response } from '../utils/groqresp.js';
import {MemoryRouter, Routes, Route} from 'react-router';

const mytestconfig = {
  server_url: "https://dummyjson.com/products",
  num_items: 50,  
  use_server: true,
  loading_timeout_ms: 2000
};

jest.setTimeout(10000);

jest.mock('../../src/config/config', () => ( {
  __esModule: true,
  default: mytestconfig  
} ));

afterAll(() => jest.resetAllMocks());

beforeEach(() => {
  jest.useFakeTimers()
});

// Running all pending timers and switching to real timers using Jest
afterEach(() => {
  jest.runOnlyPendingTimers()
  jest.useRealTimers()
});


let testinfo = {
  name: "La aplicación hace fetch de datos del servidor remoto",
  score: 1,
  msg_ok: "La aplicación hace fetch correctamente",
  msg_error: "La aplicación NO hace fetch correctamente"
}
test(JSON.stringify(testinfo), async () => {
  global.fetch = jest.fn(() => Promise.resolve({
    status: 200,
    json: () => Promise.resolve(mockdata2)
  }));

  render(<MemoryRouter initialEntries={["/"]}>
    <App />
  </MemoryRouter>);
  //run the setTimeout so the loading spinner is removed from the UX  

  await waitForElementToBeRemoved(await document.querySelector('#myspinner'), { timeout: 8000 })

  //console.log("IMPRIMIMOS EL BODY-------------------");
  //console.log(document.body.innerHTML);

  const productos = document.querySelectorAll('#productosresultados .miproducto');
  expect(productos.length).toBe(39);
  const theinput = document.querySelector('#filtro');
  expect(theinput).toBeInTheDocument();
  const buscabtn = document.querySelector('#buscador');
  expect(buscabtn).toBeInTheDocument();

});


testinfo = {
  name: "La aplicación en la página del producto renderiza los últimos 3 comentarios del producto",
  score: 0.5,
  msg_ok: "Los comentarios de la página del producto funciona correctamente",
  msg_error: "Los comentarios de la página del producto NO funcionan correctamente"
}
test(JSON.stringify(testinfo), async () => {
  global.fetch = jest.fn(() => Promise.resolve({
    status: 200,
    json: () => Promise.resolve(mockdata)
  }));

  render(<MemoryRouter initialEntries={["/products/7"]}>
    <App />
  </MemoryRouter>);
  //run the setTimeout so the loading spinner is removed from the UX
  act(()=>jest.runAllTimers());

  await waitFor(async () => {
    /*○	Hay un elemento div con un id “comments”
○	Dentro hay un div y dentro tiene un span con id “mediaresultado” que muestra la media de los comentarios recibidos (campo reviews->rating)
○	Debajo hay un h5 que tiene como contenido “Ultimos 3 comentarios:”
○	Los últimos 3 comentarios se deben recorrer con un map. Cada comentario aparece en un div con clase “comment” y contiene como la captura superior muestra el nombre del autor del comentario, el contenido y rating.
*/
    const commentsDiv = document.querySelector('#comments');
    expect(commentsDiv).toBeInTheDocument();

    const mediaResult = document.querySelector('#mediaresult');
    expect(mediaResult).toBeInTheDocument();
    expect(mediaResult).toHaveTextContent(4.20);

    const ultimosComentarios = document.querySelector('h5');
    expect(ultimosComentarios).toBeInTheDocument();
    expect(ultimosComentarios).toHaveTextContent("Últimos 3 comentarios:");

    const commentDivs = commentsDiv.querySelectorAll('.comment');
    expect(commentDivs.length).toBe(3);
      expect(commentsDiv).toHaveTextContent("Pepe Perez");
      expect(commentsDiv).toHaveTextContent("Muy impresionado!");
      expect(commentsDiv).toHaveTextContent("Leah Henderson");
      expect(commentsDiv).toHaveTextContent("Producto excelente!");
      expect(commentsDiv).toHaveTextContent("Sophia Turner");
      //do not contain "Olivia Brown" which is not in the last 3 comments
      expect(commentsDiv).not.toHaveTextContent("Olivia Brown");
  });
});


testinfo = {
  name: "La aplicación en la página del producto renderiza los últimos 3 comentarios del producto (2º render)",
  score: 0.5,
  msg_ok: "Los comentarios de la página del producto funciona correctamente",
  msg_error: "Los comentarios de la página del producto NO funcionan correctamente"
}
test(JSON.stringify(testinfo), async () => {
  global.fetch = jest.fn(() => Promise.resolve({
    status: 200,
    json: () => Promise.resolve(mockdata)
  }));
  render(<MemoryRouter initialEntries={["/products/25"]}>
    <App />
  </MemoryRouter>);
  //run the setTimeout so the loading spinner is removed from the UX
  act(()=>jest.runAllTimers());

  await waitFor(async () => {
    /*○	Hay un elemento div con un id “comments”
○	Dentro hay un div y dentro tiene un span con id “mediaresultado” que muestra la media de los comentarios recibidos (campo reviews->rating)
○	Debajo hay un h5 que tiene como contenido “Ultimos 3 comentarios:”
○	Los últimos 3 comentarios se deben recorrer con un map. Cada comentario aparece en un div con clase “comment” y contiene como la captura superior muestra el nombre del autor del comentario, el contenido y rating.
*/
    const commentsDiv = document.querySelector('#comments');
    expect(commentsDiv).toBeInTheDocument();

    const mediaResult = document.querySelector('#mediaresult');
    expect(mediaResult).toBeInTheDocument();
    expect(mediaResult).toHaveTextContent(3.33);

    const ultimosComentarios = document.querySelector('h5');
    expect(ultimosComentarios).toBeInTheDocument();
    expect(ultimosComentarios).toHaveTextContent("Últimos 3 comentarios:");

    const commentDivs = commentsDiv.querySelectorAll('.comment');
    expect(commentDivs.length).toBe(3);
      expect(commentsDiv).toHaveTextContent("Alonso Wright");
      expect(commentsDiv).toHaveTextContent("Santiago Martínez");
      expect(commentsDiv).toHaveTextContent("María García");
      //do not contain "Jose López" which is not in the last 3 comments
      expect(commentsDiv).not.toHaveTextContent("Jose López");
  });
});



testinfo = {
  name: "La aplicación llama a la IA para generar un resumen de los comentarios",
  score: 1,
  msg_ok: "El resumen de los comentarios con IA funciona correctamente",
  msg_error: "El resumen de los comentarios con IA NO funcionan correctamente"
}
test(JSON.stringify(testinfo), async () => {
  global.fetch = jest.fn(() => Promise.resolve({
    status: 200,
    json: () => Promise.resolve(groq_response)
  }));
  // Render con ruta que define el parámetro :productId para que useParams lo reciba
  render(
    <MemoryRouter initialEntries={["/26"]}>
      <Routes>
        <Route path="/:productId" element={<ProductPage theproducts={mockdata.products} />} />
      </Routes>
    </MemoryRouter>
  );
  
  //run the setTimeout so the loading spinner is removed from the UX
  act(()=>jest.runAllTimers());

  // Si hubiera spinner en esta vista, se podría esperar a su desaparición;
  // en ProductPage no es necesario.

    /*○	En la zona de los comentarios la aplicación tiene un button con id “summarybtn” que al hacerle click hace un POST a https://api.groq.com/openai/v1/chat/completions con un prompt como el siguiente que contiene el contenido de los últimos 3 comentarios: “PROMPT: Crea un resumen de ...”
      ○	Se recibe la respuesta y se muestra el resultado provisto por la IA (data.choices[0].message.content) si existe, esto sale en un div con clase “summary”.
    */

    const summaryBtn = document.querySelector('#summarybtn');
    expect(summaryBtn).toBeInTheDocument();

    // Simulate click on summary button
    fireEvent.click(summaryBtn);

    await waitFor(() => {
      const summary = document.querySelector('.summary');
      expect(summary).toBeInTheDocument();
      expect(summary.textContent).toMatch(/Resumen de Comentarios mock de Green Chili Pepper/);
      expect(summary.textContent).toMatch(/Opiniones negativas/);
      expect(summary.textContent).toMatch(/excelente producto/);
      expect(summary.textContent).toMatch(/mockmockmuy decepcionado/);
    });

});