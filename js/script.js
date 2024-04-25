const urlAPI = "https://chat-api-opz7.onrender.com";
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
	fetch(urlAPI+"/entrar", {
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
      fetch(urlAPI + "/salas", {
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
    fetch(`${urlAPI}/sala/entrar?idsala=${idSala}`, {
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
            

            // Iniciar atualização de mensagens periodicamente após entrar na sala
            atualizarMensagensPeriodicamente()
        }else {
            console.log("Resposta da API inválida:", data);
        }
    })
    .catch((error) => {
        console.error("Erro na requisição:", error);
    });
}




function enviarMensagem(msg, salaSelecionadaId) {
    fetch(`${urlAPI}/sala/mensagem?idSala=${salaSelecionadaId}`, {
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
            // Limpar campo de mensagem após o envio
            inputMensagem.value = "";
            // Mostrar aviso de mensagem enviada
            exibirAviso("Mensagem enviada: " + msg);
            // Atualizar mensagens na sala após o envio
            mostrarMensagens(salaSelecionadaId);
        } else {
            console.log("Resposta da API inválida:", data);
        }
    })
    .catch((error) => {
        console.error("Erro na requisição:", error);
    });
}

// Função para exibir aviso de mensagem enviada
function exibirAviso(aviso) {
    console.log(aviso);
}

// Atualizar mensagens periodicamente
function atualizarMensagensPeriodicamente() {
    if (salaSelecionadaId) {
        mostrarMensagens(salaSelecionadaId);
        setTimeout(atualizarMensagensPeriodicamente, 5000); // Atualizar a cada 5 segundos
    }
}
function mostrarMensagens(idSala, time) {
    salaSelecionadaId = idSala;
 
    fetch(`${urlAPI}/sala/mensagens?idSala=${idSala}&timestamp=`,{
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
            mensagensContainer.innerHTML = "";
 
            data.forEach((msgs) => {
                const mensagemElement = document.createElement("div");
                mensagemElement.textContent = `${msgs.nick}: ${msgs.msg}`;
                mensagensContainer.appendChild(mensagemElement);
            });
        } else {
            console.error("Resposta da API não contém dados");
        }
    })
    .catch((error) => {
        console.error("Erro na requisição lista msg:", error);
    });
}
