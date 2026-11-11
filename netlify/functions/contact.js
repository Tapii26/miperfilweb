/* ============================================================
   Función de Netlify: recibe el formulario de contacto,
   valida los datos y envía un correo con diseño (HTML) a tu
   Gmail (vía SMTP autenticado con nodemailer).
   Variables de entorno necesarias (se configuran en Netlify):
     - GMAIL_USER         : tu Gmail (jjtapiador1@gmail.com)
     - GMAIL_APP_PASSWORD : contraseña de aplicación de Gmail
   ============================================================ */

const nodemailer = require("nodemailer");

function esc(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[c];
  });
}

function limpiar(s) {
  return String(s || "")
    .replace(/[\r\n]+/g, " ")
    .trim();
}

function esEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function construirEmail(d) {
  var nombre = esc(d.nombre);
  var email = esc(d.email);
  var telefono = esc(d.telefono);
  var mensaje = esc(d.mensaje).replace(/\n/g, "<br>");

  var bloqueContacto =
    d.telefono === ""
      ? 'No ha dejado un teléfono, pero puedes contactar enviándole un correo a ' +
        '<a href="mailto:' +
        email +
        '" style="color:#63b2ae;font-weight:700;text-decoration:none;">' +
        email +
        "</a>."
      : "Puedes contactar mediante el correo electrónico " +
        '<a href="mailto:' +
        email +
        '" style="color:#63b2ae;font-weight:700;text-decoration:none;">' +
        email +
        "</a> o el número " +
        '<a href="tel:' +
        telefono.replace(/\s/g, "") +
        '" style="color:#63b2ae;font-weight:700;text-decoration:none;">' +
        telefono +
        "</a>.";

  return (
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0eeee;margin:0;padding:28px 12px;font-family:Segoe UI,Arial,sans-serif;">' +
    '<tr><td align="center">' +
    '<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 12px 30px rgba(34,34,34,0.12);">' +
    '<tr><td style="background-color:#222222;padding:26px 32px;">' +
    '<span style="font-size:22px;font-weight:800;color:#f0eeee;">Juanjo&nbsp;Tapiador<span style="color:#cf8585;">.</span><span style="color:#84cbc7;">.</span></span>' +
    '<div style="margin-top:4px;font-size:13px;color:#9a9a9a;letter-spacing:1px;text-transform:uppercase;">Nuevo mensaje desde tu web</div>' +
    "</td></tr>" +
    '<tr><td style="padding:34px 32px 12px 32px;">' +
    '<p style="margin:0 0 4px 0;font-size:14px;color:#5a5a5a;">Ha contactado contigo</p>' +
    '<h1 style="margin:0 0 26px 0;font-size:30px;font-weight:800;color:#b56363;line-height:1.1;">' +
    nombre +
    "</h1>" +
    '<p style="margin:0 0 12px 0;font-size:15px;font-weight:700;color:#222222;">El mensaje que ha dejado ha sido el siguiente:</p>' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>' +
    '<td style="background-color:#f0eeee;border-left:4px solid #cf8585;border-radius:0 10px 10px 0;padding:18px 20px;font-size:15px;color:#333333;line-height:1.6;">' +
    mensaje +
    "</td></tr></table>" +
    "</td></tr>" +
    '<tr><td style="padding:8px 32px 30px 32px;">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>' +
    '<td style="background-color:#e4f1f0;border-radius:12px;padding:18px 20px;font-size:15px;color:#222222;line-height:1.6;">' +
    bloqueContacto +
    "</td></tr></table>" +
    "</td></tr>" +
    '<tr><td style="background-color:#1a1a1a;padding:16px 32px;text-align:center;">' +
    '<span style="font-size:12px;color:#9a9a9a;">Enviado automáticamente desde tu perfil web · Juanjo Tapiador</span>' +
    "</td></tr>" +
    "</table></td></tr></table>"
  );
}

function responder(ok, mensaje, esAjax) {
  if (esAjax) {
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ ok: ok, mensaje: mensaje }),
    };
  }
  var color = ok ? "#63b2ae" : "#b56363";
  var titulo = ok ? "¡Mensaje enviado!" : "Ups...";
  return {
    statusCode: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
    body:
      '<!DOCTYPE html><html lang="es"><head><meta charset="utf-8">' +
      '<meta name="viewport" content="width=device-width, initial-scale=1"><title>Juanjo Tapiador</title></head>' +
      '<body style="font-family:Segoe UI,Arial,sans-serif;background:#f0eeee;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0;">' +
      '<div style="background:#fff;padding:40px;border-radius:16px;text-align:center;box-shadow:0 12px 30px rgba(34,34,34,.12);max-width:420px;">' +
      '<h1 style="color:' +
      color +
      ';margin:0 0 12px;">' +
      titulo +
      "</h1>" +
      '<p style="color:#5a5a5a;margin:0 0 24px;">' +
      esc(mensaje) +
      "</p>" +
      '<a href="/" style="display:inline-block;background:#cf8585;color:#fff;padding:12px 26px;border-radius:10px;text-decoration:none;font-weight:700;">Volver a la web</a>' +
      "</div></body></html>",
  };
}

exports.handler = async function (event) {
  var esAjax =
    (event.headers["x-requested-with"] || "").toLowerCase() ===
    "xmlhttprequest";

  if (event.httpMethod !== "POST") {
    return responder(false, "Método no permitido.", esAjax);
  }

  var body = event.isBase64Encoded
    ? Buffer.from(event.body || "", "base64").toString("utf8")
    : event.body || "";
  var params = new URLSearchParams(body);

  // Trampa antispam: si el campo oculto viene relleno, es un bot
  if (params.get("website")) {
    return responder(true, "Gracias por tu mensaje.", esAjax);
  }

  var nombre = limpiar(params.get("name"));
  var email = limpiar(params.get("email"));
  var telefono = limpiar(params.get("phone"));
  var mensaje = (params.get("message") || "").slice(0, 500).trim();

  if (!nombre || !mensaje || !esEmail(email)) {
    return responder(false, "Revisa el nombre, el email y el mensaje.", esAjax);
  }

  try {
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: '"Web Juanjo Tapiador" <' + process.env.GMAIL_USER + ">",
      to: process.env.GMAIL_USER,
      replyTo: email,
      subject: "📩 Nuevo mensaje de " + nombre + " desde tu web",
      html: construirEmail({
        nombre: nombre,
        email: email,
        telefono: telefono,
        mensaje: mensaje,
      }),
    });

    return responder(
      true,
      "¡Gracias! Tu mensaje se ha enviado correctamente.",
      esAjax
    );
  } catch (e) {
    return responder(
      false,
      "No se ha podido enviar. Inténtalo de nuevo en un momento.",
      esAjax
    );
  }
};
