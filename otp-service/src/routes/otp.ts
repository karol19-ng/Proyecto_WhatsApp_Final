import { Router, Request, Response } from "express";
import OTP from "../models/OTP";
import RegisteredPhone from "../models/RegisteredPhone";

const router = Router();

// Generar código único de 6 dígitos para un número
const generateCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// POST /api/otp/register
// Registrar un número en el sistema (solo números registrados pueden chatear)
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { phone, name } = req.body;
    if (!phone) return res.status(400).json({ error: "Número requerido" });

    const existing = await RegisteredPhone.findOne({ phone });
    if (existing) {
      return res.json({
        message: "Número ya registrado",
        phone: existing.phone,
      });
    }

    const registered = await RegisteredPhone.create({
      phone,
      name: name || "",
    });
    res
      .status(201)
      .json({ message: "Número registrado", phone: registered.phone });
  } catch {
    res.status(500).json({ error: "Error al registrar número" });
  }
});

// POST /api/otp/send
// Genera y "envía" el código al número (lo guarda en DB y lo retorna para mostrarlo en la web)
router.post("/send", async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: "Número requerido" });

    // Verificar que el número esté registrado
    const registered = await RegisteredPhone.findOne({ phone });
    if (!registered) {
      return res.status(403).json({
        error: "Número no registrado",
        message:
          "Este número no está registrado en el sistema. Solo números registrados pueden iniciar sesión.",
      });
    }

    // Invalidar OTPs anteriores del mismo número
    await OTP.deleteMany({ phone, verified: false });

    // Generar nuevo código con 10 minutos de vigencia
    const code = generateCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await OTP.create({ phone, code, expiresAt });

    // Retornamos el código directamente — la web lo muestra en pantalla
    // (simula el "SMS interno" del sistema de mensajería)
    res.json({
      success: true,
      phone,
      code, // ← La web muestra esto en el popup
      expiresIn: 600, // segundos
      message: `Su código de verificación de SecureChat es: ${code}`,
    });
  } catch {
    res.status(500).json({ error: "Error al generar código" });
  }
});

// POST /api/otp/verify
// Verificar el código ingresado por el usuario
router.post("/verify", async (req: Request, res: Response) => {
  try {
    const { phone, code } = req.body;
    if (!phone || !code)
      return res.status(400).json({ error: "Número y código requeridos" });

    const otp = await OTP.findOne({
      phone,
      verified: false,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 });

    if (!otp) {
      return res
        .status(400)
        .json({
          error: "Código expirado o no encontrado. Solicita uno nuevo.",
        });
    }

    // Máximo 5 intentos
    if (otp.attempts >= 5) {
      await OTP.deleteOne({ _id: otp._id });
      return res
        .status(400)
        .json({ error: "Demasiados intentos. Solicita un nuevo código." });
    }

    if (otp.code !== code) {
      otp.attempts += 1;
      await otp.save();
      return res.status(400).json({
        error: "Código incorrecto",
        attemptsLeft: 5 - otp.attempts,
      });
    }

    // Código correcto
    otp.verified = true;
    await otp.save();

    const registered = await RegisteredPhone.findOne({ phone });

    res.json({
      success: true,
      phone,
      name: registered?.name || "",
      message: "Verificación exitosa",
    });
  } catch {
    res.status(500).json({ error: "Error al verificar código" });
  }
});

// GET /api/otp/check/:phone
// Verificar si un número está registrado
router.get("/check/:phone", async (req: Request, res: Response) => {
  try {
    const phone = decodeURIComponent(req.params.phone);
    const registered = await RegisteredPhone.findOne({ phone });
    res.json({ registered: !!registered, name: registered?.name || "" });
  } catch {
    res.status(500).json({ error: "Error al verificar" });
  }
});

// GET /api/otp/registered
// Listar todos los números registrados (para admin)
router.get("/registered", async (_req: Request, res: Response) => {
  try {
    const phones = await RegisteredPhone.find().sort({ createdAt: -1 });
    res.json({ phones });
  } catch {
    res.status(500).json({ error: "Error al obtener números" });
  }
});

export default router;
