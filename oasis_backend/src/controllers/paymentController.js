const { MercadoPagoConfig, Preference } = require('mercadopago');

const client = new MercadoPagoConfig({ 
    accessToken: process.env.MP_ACCESS_TOKEN 
});

const crearPreferencia = async (req, res) => {
    try {
        const { plan, precio, id_reserva, addons = [] } = req.body;

        // Item del plan
        const items = [{
            title: plan,
            quantity: 1,
            unit_price: precio,
            currency_id: 'COP'
        }];

        // Agregar cada addon como ítem separado
        addons.forEach(addon => {
            items.push({
                title: addon.title,
                quantity: 1,
                unit_price: addon.precio,
                currency_id: 'COP'
            });
        });

        const preference = new Preference(client);
        const result = await preference.create({
            body: {
                items,
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