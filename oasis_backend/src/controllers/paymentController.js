const { MercadoPagoConfig, Preference } = require('mercadopago');

const client = new MercadoPagoConfig({ 
    accessToken: process.env.MP_ACCESS_TOKEN 
});

const crearPreferencia = async (req, res) => {
    try {
        const { plan, precio, id_reserva } = req.body;

        const preference = new Preference(client);
        const result = await preference.create({
            body: {
                items: [{
                    title: plan,
                    quantity: 1,
                    unit_price: precio,
                    currency_id: 'COP'
                }],
                external_reference: String(id_reserva),
                back_urls: {
                    success: 'https://proyecto-oasis-ar.vercel.app/',
                    failure: 'https://proyecto-oasis-ar.vercel.app/',
                    pending: 'https://proyecto-oasis-ar.vercel.app/'
                },
                auto_return: 'approved'
            }
        });

        res.json({ init_point: result.init_point });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error creando preferencia de pago' });
    }
};

module.exports = { crearPreferencia };