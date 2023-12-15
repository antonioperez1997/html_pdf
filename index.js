const express = require('express');
const pdf = require('html-pdf');
const Handlebars = require('handlebars');
const fs = require('fs');

const app = express();
app.set('port', 5005);
app.use(express.json({limit: "50mb"}));
app.use(express.urlencoded({
    extended: true
}));
app.use('/pdf/v1/getPdf', async function (req, res) {
    const { data, template, orientation, headerr = null, templt = null } = req.body;
    try {
        Handlebars.registerHelper('test', function (value) {
            return value === 0
        })
        const promise = new Promise((resolve, reject) => {
            const source = fs.readFileSync(template, "utf8");
            const html = Handlebars.compile(source)(data);
            
            pdf.create(html, {
                format: templt != "shipping-instruction" ? "A4" : 'Letter',
                orientation: orientation ? orientation : 'portrait',
                localUrlAccess: true,
                border: {
                    top: '0.4cm',
                    left: '0.4cm',
                    right: '0.4cm',
                },
                renderDelay: 1000,
                header: { height: headerr },
                footer: {
                    height: '2cm',
                },
            }).toBuffer(function (error, buffer) {
                if (error) {
                    console.log("Error generando el pdf", error);
                    reject(error);
                }
                resolve(buffer);
            })
        })
        const info = await Promise.all([promise]);
        return res.send(info[0]);
    } catch (error) {
        console.log(error);
        return res.status(400).send({ error: error.message })
    }
});
app.listen(app.get('port'), () => console.log("Server start at port: ", 5005));