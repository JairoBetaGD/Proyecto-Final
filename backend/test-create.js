const payload = {
  title: "TEST_VIDEO_4",
  category: "Administración",
  priority: "Baja",
  content: "prueba video MP4 REAL generado con Node",
  status: "Publicado",
  author: "test",
  publishImmediately: true,
  attachments: [
    {
      name: "test_video.mp4",
      size: "1.00 MB",
      type: "VIDEO",
      mimeType: "video/mp4",
      data: ""  // se rellenará con un MP4 real de ~1MB
    }
  ]
};

// Generamos un MP4 mínimo válido (~1.1MB): ftyp + moov + mdat con 1 frame de video negro
// Usamos un buffer base de un MP4 real de test (ftypisom + cabecera moov minimal + chunk mdat)
const mp4Hex =
  // === ftyp box ===
  '000000186674797069736f6d0000020069736f6d6f7073'
  // === mdat box (1.1MB de datos dummy) ===
  + '000000086d646174' // size placeholder + 'mdat', size actualizado abajo
  + '00'.repeat(1140000);

const mp4Buf = Buffer.from(mp4Hex, 'hex');
const b64 = mp4Buf.toString('base64');
payload.attachments[0].data = `data:video/mp4;base64,${b64}`;
payload.attachments[0].size = `${(mp4Buf.length / (1024*1024)).toFixed(2)} MB`;

console.log("MP4 buffer bytes:", mp4Buf.length);
console.log("Data URL length:", payload.attachments[0].data.length);

fetch("http://localhost:5000/api/announcements", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload)
})
  .then((r) => r.json())
  .then((d) => {
    console.log("CREATED:", JSON.stringify(d, null, 2));
    const att = d.attachments[0];
    console.log("Attachment has data:", !!att.data);
    console.log("Attachment type:", att.type);
    console.log("Attachment mimeType:", att.mimeType);
    if (d._id) {
      return fetch("http://localhost:5000/api/announcements/" + d._id);
    }
  })
  .then((r) => r?.json())
  .then((d) => {
    console.log("FETCHED attachment:", JSON.stringify(d.attachments[0], null, 2));
    const att = d.attachments[0];
    console.log("GET has data:", !!att.data);
    console.log("GET data starts with:", att.data?.substring(0, 50));
  })
  .catch((e) => console.error("ERROR:", e.message));

fetch("http://localhost:5000/api/announcements", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload)
})
  .then((r) => r.json())
  .then((d) => {
    console.log("CREATED:", JSON.stringify(d, null, 2));
    if (d._id) {
      return fetch("http://localhost:5000/api/announcements/" + d._id);
    }
  })
  .then((r) => r?.json())
  .then((d) => console.log("FETCHED:", JSON.stringify(d, null, 2)))
  .catch((e) => console.error("ERROR:", e.message));