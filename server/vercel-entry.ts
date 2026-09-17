import { handle } from 'hono/vercel'
import { createApp } from './app'

/**
 * Vercel-Entry: wird von `npm run bundle:api` (esbuild) zu api/index.js
 * gebuendelt. Der Bundle-Schritt loest ALLE lokalen Imports auf, sodass die
 * Serverless-Function keine relativen Pfade mehr zur Laufzeit aufloesen muss.
 *
 * WICHTIG: Vercels aktuelle Function-Runtime erwartet benannte HTTP-Methoden-
 * Exporte (GET/POST/...), deren Rueckgabewert (Response) verwendet wird.
 * Ein reiner default-Export wird mit "(req,res)=>void"-Signatur interpretiert
 * und Response-Rueckgaben IGNORIERT -> die API haengt im Timeout.
 * Darum: jede Methode explizit exportieren.
 */
const handler = handle(createApp())

export const runtime = 'nodejs'
export const maxDuration = 60

// KEIN default-Export! Vercel bevorzugt default (Node-Helper-Signatur
// "(req,res)=>void") und wuerde dann Response-Rueckgaben ignorieren.
// Mit NUR benannten Methoden-Exporten nutzt die Runtime den Web-Standard
// (fetch-Signatur) und verwendet den zurueckgegebenen Response korrekt.
export const GET = handler
export const POST = handler
export const PUT = handler
export const PATCH = handler
export const DELETE = handler
export const OPTIONS = handler
export const HEAD = handler

