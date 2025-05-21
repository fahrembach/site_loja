const express = require('express');
const cors = require('cors');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Endpoint para criar assinatura Mercado Pago
app.post('/api/create-preapproval', async (req, res) => {
  try {
    const { planName, planDesc, price } = req.body;
    const ACCESS_TOKEN = process.env.VITE_MP_ACCESS_TOKEN || process.env.MP_ACCESS_TOKEN;
    if (!ACCESS_TOKEN) {
      return res.status(500).json({ error: 'Access Token não encontrado' });
    }
    const preapprovalResp = await fetch('https://api.mercadopago.com/preapproval', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reason: planName,
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: price,
          currency_id: 'BRL',
        },
        back_url: req.headers.origin || 'http://localhost:5173/assinatura-finalizada',
        payer_email: '', // preenchido pelo usuário no fluxo MP
      }),
    });
    if (!preapprovalResp.ok) {
      const errorData = await preapprovalResp.text();
      return res.status(500).json({ error: 'Erro na chamada Mercado Pago: ' + errorData });
    }
    const preapprovalData = await preapprovalResp.json();
    if (!preapprovalData.init_point) {
      return res.status(500).json({ error: 'init_point não encontrado, response: ' + JSON.stringify(preapprovalData) });
    }
    return res.json({ init_point: preapprovalData.init_point });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log('Servidor backend Mercado Pago rodando na porta ' + PORT);
});
