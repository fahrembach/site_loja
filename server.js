import express from 'express';
import cors from 'cors';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import 'dotenv/config';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Configuração do Mercado Pago
const client = new MercadoPagoConfig({ 
  accessToken: process.env.VITE_MP_ACCESS_TOKEN || process.env.MP_ACCESS_TOKEN
});

// Endpoint para criar preferência de pagamento
app.post('/api/create-preference', async (req, res) => {
  try {
    const { items } = req.body;

    const preference = new Preference(client);
    const result = await preference.create({
      items: items.map(item => ({
        title: item.nome,
        unit_price: Number(item.preco?.replace(/[^0-9,]/g, '').replace(',', '.')) || 0,
        quantity: item.quantidade,
        currency_id: 'BRL'
      })),
      back_urls: {
        success: `${req.headers.origin}/success`,
        failure: `${req.headers.origin}/failure`,
        pending: `${req.headers.origin}/pending`
      },
      auto_return: 'approved'
    });

    res.json({ id: result.id });
  } catch (error) {
    console.error('Erro ao criar preferência:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para criar assinatura
app.post('/api/create-preapproval', async (req, res) => {
  try {
    const { planName, planDesc, price } = req.body;
    
    const preapproval = {
      reason: planName,
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: price,
        currency_id: 'BRL'
      },
      back_url: req.headers.origin || 'http://localhost:5173/assinatura-finalizada',
      payer_email: ''
    };

    const response = await fetch('https://api.mercadopago.com/preapproval', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.VITE_MP_ACCESS_TOKEN || process.env.MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(preapproval)
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error('Erro na chamada Mercado Pago: ' + errorData);
    }

    const data = await response.json();
    res.json({ init_point: data.init_point });
  } catch (error) {
    console.error('Erro ao criar assinatura:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log('Servidor backend Mercado Pago rodando na porta ' + PORT);
});