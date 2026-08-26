# CaputeStore — Eletrônicos • Qualidade • Confiança (Angular 20 + SCSS + Node.js Express)

Projeto completo da **CaputeStore** com visual premium baseado na especificação de design guide (Preto `#000000`, Amarelo `#FFD700`, Branco `#FFFFFF`, fontes `Orbitron` e `Poppins`), novo sistema de cupons com sorteios e 1ª compra, Área VIP (R$ 20,00) com link exclusivo do WhatsApp e parcerias digitais, e servidor backend em Node.js/Express para validação de regras no lado do servidor.

---

## 🚀 Como Executar o Projeto

1. **Instalar dependências**:
   ```bash
   npm install
   ```

2. **Iniciar o Backend API (Node.js Express)**:
   ```bash
   npm run server
   ```
   *O backend rodará na porta `3000` (http://localhost:3000).*

3. **Iniciar o Frontend Angular**:
   ```bash
   npm start
   ```
   *Acesse a aplicação no navegador em `http://localhost:4200`.*

4. **Gerar Build de Produção**:
   ```bash
   npm run build
   ```

---

## ⭐ Funcionalidades & Regras de Negócio Implementadas

### 1. Sistema de Cupons & Sorteios
- **Cupom de Primeira Compra (10% OFF)**:
  - Código `PRIMEIRA10` / `BEMVINDO10`.
  - Válido exclusivamente para a **1ª compra** do cliente. O backend e o serviço de autenticação rastreiam o histórico e impedem reuso em compras posteriores.
- **Sorteio de Cupons Normais (15% OFF)**:
  - Cota total de 25 cupons de 15% OFF sorteados entre clientes participantes. Cada ganhador recebe um código individual e intransferível.
- **Sorteios Premium (25% e 30% OFF)**:
  - **Sorteio Premium 25%**: 15 cupons exclusivos.
  - **Sorteio Premium 30%**: 10 cupons exclusivos.
  - Exclusivos para membros **Premium / VIP**. O sistema valida o status do usuário no backend e no frontend antes de permitir a participação ou resgate.

### 2. Área VIP (R$ 20,00) & Benefícios Exclusivos
- **Assinatura do Plano VIP por R$ 20,00**: Modal e página interativa com pagamentos via PIX, Cartão ou Boleto.
- **Link do Grupo Exclusivo no WhatsApp**: Redirecionamento direto (`https://chat.whatsapp.com/CaputeStoreVIPExclusivo`) desbloqueado após a assinatura.
- **Ofertas Antecipadas & Lançamentos**: Acesso prioritário aos produtos marcados com o selo VIP.
- **Plataformas de Parcerias Digitais (Expansível)**:
  - 🎬 **Filmes & Entretenimento**: CineMax VIP Pass (1 Mês Grátis)
  - 🎧 **Streaming & Música**: SoundPrime Ultra (2 Meses Hi-Fi)
  - 🎮 **Games & E-Sports**: GameVault Pass (20% OFF em Keys)
  - 🚀 **Cursos & Tecnologia**: TechAcademy Pro (40% OFF em Bootcamps)

### 3. Redesign Visual CaputeStore
- **Identidade Visual**: Logo em amarelo com ícone de carrinho formando a letra "C", tipografia Orbitron para títulos e Poppins para o corpo.
- **Hero Section**: Neon glow amarelado com slogan *"TECNOLOGIA QUE MOVE O SEU MUNDO"* e botão *"VER OFERTAS"*.
- **Faixa de Confiança**: 🚚 Entrega Rápida, 🔒 Pagamento Seguro, 💳 Até 12x Sem Juros, 🎧 Suporte Especializado.
- **Newsletter Strip**: Faixa amarela (`#FFD700`) com 10% OFF na primeira compra.
- **Cards de Produto**: Cálculo de parcelamento em até 12x (`ou 12x de R$ X`), badges de destaque e favoritar reativo.

---

## 📦 Arquivo ZIP do Projeto

O arquivo completo contendo todo o código-fonte está gerado no diretório raiz do projeto:
- `caputestore-projeto-final.zip`
