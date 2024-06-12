const urlApi = 'https://chat-api-opz7.onrender.com';

const entrada = document.querySelector("#entrada");
const listaSalas = document.querySelector("#lista-salas");
const mensagensSala = document.querySelector("#mensagens-sala");
const criaSala = document.querySelector("#cria-sala");

const formEnviarMensagem = document.querySelector("#form-enviar-mensagem");
const inputMensagem = document.querySelector("#input-mensagem");
const mensagensContainer = document.querySelector("#mensagens");
let salaSelecionadaId = null;

const user = {};

// entrar usuario
document.querySelector('#entrar').addEventListener('click', (evt) => {
    evt.preventDefault(); 
    let nick = document.querySelector('#input-nick').value;
  
    entrarUser(nick);
  });
  
  const entrarUser = (nick) =>{
      fetch(urlApi+"/entrar", {
      method: "POST",
      headers: {"Content-type": "application/json;charset=UTF-8"}, 
      body:JSON.stringify({nick: nick}) 
      })
      .then((res) => res.json())
      .then((data) => {
              console.log(data);
              if (data.idUser && data.nick && data.token) { 
                      user.idUser = data.idUser;
                      user.nick = data.nick;
                      user.token = data.token;
  
                      entrada.style.display = 'none';
  
                      mostrarSalas();
              } else {
                      console.log("Resposta da API inválida:", data);
              }
      })
      .catch((error) => {
              console.log("Erro na requisição:", error);
      });
  }
  // listar salas
  const mostrarSalas = () => {
    if (user.token && user.nick) {
        fetch(urlApi + "/salas", {
                method: "GET",
                headers: {
                    'Content-Type': 'application/json',
                    'nick': user.nick,
                    'token': user.token,
                    'idUser': user.idUser
                }
            })
            .then((res) => res.json())
            .then((data) => {
                if (data) {
                    listaSalas.innerHTML = "";
  
                    data.forEach(sala => {
                        const salaElement = document.createElement("div");
                        salaElement.innerHTML = `
                            <h2>${sala.nome}</h2>
                            <p>${sala.tipo}</p>
                            <button class="btn btn-primary btn-sm entrar-sala" data-id="${sala._id}">Entrar na Sala</button>
                        `;
                        listaSalas.appendChild(salaElement);
                    });
  
                    listaSalas.style.display= 'block'
  
                    document.querySelectorAll('.entrar-sala').forEach(btn => {
                        btn.addEventListener('click', () => {
                            const idSala = btn.dataset.id;
                            entrarNaSala(idSala);
  
                            listaSalas.style.display='none';
                          });
                      });
  
                  const botaoSairUser = document.createElement("button");
                      botaoSairUser.textContent = "Sair do Usuário";
                      botaoSairUser.classList.add("btn", "btn-danger", "btn-sm");
                      botaoSairUser.addEventListener('click', () => {
                      sairDoUser(user.idUser); 
                  });
                      listaSalas.appendChild(botaoSairUser);
  
                } else {
                    console.error("Resposta da API não contém dados");
                }
            })
            .catch((error) => {
                console.error("Erro na requisição:", error);
            });
    }
  }
  // entrar na sala
  function entrarNaSala(idSala) {
      fetch(`${urlApi}/sala/entrar?idsala=${idSala}`,{
          method: "PUT",
          headers: {
              'Content-Type': 'application/json',
              'nick': user.nick,
              'token': user.token,
              'idUser': user.idUser
          }
      })
      .then((res) => res.json())
      .then((data) => {
          console.log(data);
          if (data.msg === 'OK') { 
              const time = data.timestamp;
              
              mensagensSala.style.display = 'block';
              salaSelecionadaId = idSala;
  
              document.querySelector('#enviar-mensagem').addEventListener('click', (evt) => {
                  evt.preventDefault(); 
                  let msg = document.querySelector('#input-mensagem').value;
                
                  enviarMensagem(msg,salaSelecionadaId);
                  mostrarMensagens(salaSelecionadaId, time);
              
  
                      listaSalas.style.display='none';
                  });
              
              atualizarMSG()
          }else {
              console.log("Resposta da API inválida:", data);
          }
      })
      .catch((error) => {
          console.error("Erro na requisição:", error);
      });
  }
  // enviar msg
  function enviarMensagem(msg, salaSelecionadaId) {
      fetch(`${urlApi}/sala/mensagem?idSala=${salaSelecionadaId}`, {
          method: "POST",
          headers: {
              'Content-Type': 'application/json',
              'nick': user.nick,
              'token': user.token,
              'idUser': user.idUser
          },
          body: JSON.stringify({
              idSala: salaSelecionadaId,
              msg: msg
          })
      })
      .then((res) => res.json())
      .then((data) => {
          console.log(data);
          if (data.msg === 'OK') {
              
              inputMensagem.value = "";
              
              exibirAviso("Mensagem enviada: " + msg);
              
              mostrarMensagens(salaSelecionadaId);
          } else {
              console.log("Resposta da API inválida:", data);
          }
      })
      .catch((error) => {
          console.error("Erro na requisição:", error);
      });
  }
  
  // aviso de mensagem enviada
  function exibirAviso(aviso) {
      console.log(aviso);
  }
  
  // Atualizar mensagens 
  function atualizarMSG() {
      if (salaSelecionadaId) {
          mostrarMensagens(salaSelecionadaId);
          setTimeout(atualizarMSG, 5000); 
      }
  }
  // mostra msg
  function mostrarMensagens(idSala, time) {
      salaSelecionadaId = idSala;
   
      fetch(`${urlApi}/sala/mensagens?idSala=${idSala}&timestamp=`, {
          method: "GET",
          headers: {
              'Content-Type': 'application/json',
              'nick': user.nick,
              'token': user.token,
              'idUser': user.idUser
          }
      })
      .then((res) => res.json())
      .then((data) => {
          if (data && data.msgs) {
              mensagensContainer.innerHTML = "";
  
              const msgs = data.msgs;
              if (Array.isArray(msgs)) {
                  
                  msgs.forEach((msg) => {
                      const mensagemElement = document.createElement("div");
                      mensagemElement.textContent = `${msg.nick}: ${msg.msg}`;
                      mensagensContainer.appendChild(mensagemElement);
                  });
              } else {
                  
                  const mensagemElement = document.createElement("div");
                  mensagemElement.textContent = `${msgs.nick}: ${msgs.msg}`;
                  mensagensContainer.appendChild(mensagemElement);
              }
          } else {
              console.error("Resposta da API não contém dados");
          }
      })
      .catch((error) => {
          console.error("Erro na requisição lista msg:", error);
      });
  }
  
  // button sair
  function criarBotaoSairSala() {
      const botaoSair = document.createElement("button");
      botaoSair.textContent = "Sair da Sala";
      botaoSair.classList.add("btn", "btn-danger", "btn-sm");
      botaoSair.id = "sair-sala";
      mensagensSala.appendChild(botaoSair);
  }
  criarBotaoSairSala();
  
  // ev sair
  document.querySelector('#sair-sala').addEventListener('click', () => {
      sairDaSala();
  });
  
  
  // Função para sair da sala
  function sairDaSala() {
      fetch(`${urlApi}/sala/sair`, {
          method: "PUT",
          headers: {
              'Content-Type': 'application/json',
              'nick': user.nick,
              'token': user.token,
              'idUser': user.idUser
          }
      })
      .then((res) => res.json())
      .then((data) => {
          console.log(data);
          if (data) {
              
              mensagensContainer.innerHTML = "";
              
              mensagensSala.style.display = 'none';
              
              listaSalas.style.display = 'block';
              
              salaSelecionadaId = null;
          } else {
              console.log("Erro ao sair da sala:", data);
          }
      })
      .catch((error) => {
          console.error("Erro na requisição:", error);
      });
  }
  
  // Função para sair da sala
  function sairDoUser(idUser) {
  
      fetch(`${urlApi}/sair-user?idUser=${idUser}`, {
          method: "POST",
          headers: {
              'Content-Type': 'application/json',
              'nick': user.nick,
              'token': user.token,
              'idUser': user.idUser
          }
      })
      .then((res) => res.json())
      .then((data) => {
          console.log(data);
          if (data.msg === 'OK') {
              
              listaSalas.style.display = 'none';
              
              entrada.style.display = 'block';
  
          } else {
              console.log("Erro ao sair do usuario", data);
          }
      })
      .catch((error) => {
          console.error("Erro na requisição:", error);
      });
  }