# 🕸️ Pitter OS (Ubuntu Edition)

Bem-vindo ao **Pitter OS**, um simulador de sistema operacional ultra-realista baseado em Ubuntu, rodando diretamente no seu Windows através do Electron.

![Pitter OS Logo](https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png) <!-- Sugestão: Substituir por um logo oficial depois -->

## 🚀 Como instalar e rodar (Para Usuários)

Se você acabou de baixar o Pitter OS, siga estes passos simples:

1.  **Instale o Node.js**: O Pitter OS precisa do Node.js para funcionar. Baixe e instale a versão **LTS** em: [nodejs.org](https://nodejs.org/).
2.  **Extraia o Arquivo**: Se você baixou um arquivo `.zip`, **extraia todo o conteúdo** para uma pasta no seu computador (Ex: Área de Trabalho). **Não tente rodar de dentro do WinRAR/ZIP**.
3.  **Inicie o Sistema**:
    - Abra a pasta extraída.
    - Dê um duplo clique no arquivo `abrir_pitter_os.bat`.
    - Na primeira vez, ele vai baixar as dependências automaticamente (isso pode demorar uns 2 minutos).
    - Divirta-se!

---

## 🛠️ Recursos Atuais

- **Google Chrome Real**: Navegue em qualquer site (YouTube, Google, etc.) usando a tecnologia Webview.
- **Game Hub**: Central de jogos integrada para passar o tempo.
- **Terminal Ubuntu**: Simulação de comandos Linux via WSL (visto que o Pitter OS foca na experiência Ubuntu).
- **Interface Fluida**: Efeito "Jelly Window" ao arrastar janelas e animações de janelas maximizadas.
- **Taskbar Inteligente**: Indicadores de aplicativos abertos e foco em tempo real.

---

## 💻 Para Desenvolvedores

Se você quer modificar o código do Pitter OS:

### Requisitos
- Node.js instalado.
- WSL (Windows Subsystem for Linux) instalado para os comandos de terminal funcionarem.

### Comandos
```bash
# Instalar dependências
npm install

# Rodar em modo de desenvolvimento
npm run dev

# Gerar o instalador (.exe)
npm run build
```

---

## ❓ FAQ - Solução de Problemas

- **A tela do navegador está preta?**: Certifique-se de que você está conectado à internet e tente recarregar o navegador ou digitar a URL novamente.
- **O terminal não reconhece comandos?**: O Pitter OS usa o **WSL** do Windows para rodar comandos reais de Linux. Digite `wsl --install` no seu PowerShell (como administrador) se quiser habilitar essa função.
- **O prompt fecha sozinho?**: Verifique se você extraiu a pasta e se o Node.js está instalado corretamente.

---

**Criado por Jean Pitter** 🚀🕸️
