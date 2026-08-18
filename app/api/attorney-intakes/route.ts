import {
  allowedAttorneyServices,
  custodyStatuses,
  preferredContacts,
  submitterRoles,
  urgencyOptions,
} from "@/app/_lib/attorney-intake";
import { cleanString, clientHash, ensureDatabase, validEmail } from "@/db/runtime";

const CONSENT_VERSION = "attorney-intake-2026-08-18";
const MAX_REQUEST_BYTES = 32 * 1024;

function validDate(value: string) {
  if (!value) return true;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

function referenceCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  const code = Array.from(bytes, (value) => value.toString(36).padStart(2, "0")).join("").slice(0, 7).toUpperCase();
  return `CTN-${new Date().getUTCFullYear()}-${code}`;
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";
    const contentLength = Number(request.headers.get("content-length") ?? 0);
    const origin = request.headers.get("origin");
    if (!contentType.toLowerCase().startsWith("application/json")) {
      return Response.json({ message: "This intake must be submitted from the secure website form." }, { status: 415 });
    }
    if (contentLength > MAX_REQUEST_BYTES) {
      return Response.json({ message: "The intake is too large. Please shorten the narrative fields." }, { status: 413 });
    }
    if (origin && origin !== new URL(request.url).origin) {
      return Response.json({ message: "This intake must be submitted from the secure website form." }, { status: 403 });
    }

    const body = await request.json() as Record<string, unknown>;
    if (cleanString(body.website, 120)) {
      return Response.json({ referenceCode: "CTN-RECEIVED", message: "Your intake request has been received." }, { status: 201 });
    }

    const attorneyFirstName = cleanString(body.attorneyFirstName, 80);
    const attorneyLastName = cleanString(body.attorneyLastName, 80);
    const firmName = cleanString(body.firmName, 160);
    const email = cleanString(body.email, 160).toLowerCase();
    const confirmEmail = cleanString(body.confirmEmail, 160).toLowerCase();
    const phone = cleanString(body.phone, 30);
    const submitterRole = cleanString(body.submitterRole, 30);
    const preferredContact = cleanString(body.preferredContact, 20);
    const timeZone = cleanString(body.timeZone, 60);
    const bestContactTime = cleanString(body.bestContactTime, 120);
    const barJurisdiction = cleanString(body.barJurisdiction, 100);
    const barNumber = cleanString(body.barNumber, 40);
    const clientName = cleanString(body.clientName, 160);
    const knownAliases = cleanString(body.knownAliases, 300);
    const matterCaption = cleanString(body.matterCaption, 200);
    const caseNumber = cleanString(body.caseNumber, 100);
    const courtJurisdiction = cleanString(body.courtJurisdiction, 200);
    const prosecutingAgency = cleanString(body.prosecutingAgency, 160);
    const relatedParties = cleanString(body.relatedParties, 1000);
    const custodyStatus = cleanString(body.custodyStatus, 20);
    const urgency = cleanString(body.urgency, 30);
    const criticalDateType = cleanString(body.criticalDateType, 80);
    const criticalDate = cleanString(body.criticalDate, 10);
    const investigativeObjective = cleanString(body.investigativeObjective, 1500);
    const consent = cleanString(body.consent, 8);
    const services = Array.isArray(body.services)
      ? body.services.map((value) => cleanString(value, 40)).filter((value) => allowedAttorneyServices.has(value))
      : [];

    const requiredStrings = [
      attorneyFirstName,
      attorneyLastName,
      firmName,
      phone,
      timeZone,
      barJurisdiction,
      clientName,
      matterCaption,
      courtJurisdiction,
    ];
    const invalid = requiredStrings.some((value) => value.length < 2)
      || !validEmail(email)
      || email !== confirmEmail
      || !submitterRoles.has(submitterRole)
      || !preferredContacts.has(preferredContact)
      || !custodyStatuses.has(custodyStatus)
      || !urgencyOptions.has(urgency)
      || services.length === 0
      || investigativeObjective.length < 20
      || consent !== "yes"
      || !validDate(criticalDate)
      || Boolean(criticalDateType) !== Boolean(criticalDate);
    if (invalid) {
      return Response.json({ message: "Please review the required fields, matching email addresses, service selection, and critical-date information." }, { status: 400 });
    }

    const DB = await ensureDatabase();
    const hash = await clientHash(request);
    const hourCutoff = Date.now() - 60 * 60 * 1000;
    const dayCutoff = Date.now() - 24 * 60 * 60 * 1000;
    const [recentClient, recentEmail] = await Promise.all([
      DB.prepare("SELECT COUNT(*) AS count FROM attorney_intakes WHERE client_hash = ? AND created_at >= ?").bind(hash, hourCutoff).first<{ count: number }>(),
      DB.prepare("SELECT COUNT(*) AS count FROM attorney_intakes WHERE email = ? AND created_at >= ?").bind(email, dayCutoff).first<{ count: number }>(),
    ]);
    if ((recentClient?.count ?? 0) >= 3 || (recentEmail?.count ?? 0) >= 10) {
      return Response.json({ message: "We have received your recent intake requests. Please allow the team time to review them." }, { status: 429 });
    }

    const now = Date.now();
    const id = crypto.randomUUID();
    const reference = referenceCode();
    const retentionReviewAt = now + 180 * 24 * 60 * 60 * 1000;
    await DB.prepare(`INSERT INTO attorney_intakes (
      id, reference_code, created_at, updated_at, status,
      attorney_first_name, attorney_last_name, firm_name, email, phone,
      submitter_role, preferred_contact, time_zone, best_contact_time,
      bar_jurisdiction, bar_number, client_name, known_aliases, matter_caption,
      case_number, court_jurisdiction, prosecuting_agency, related_parties,
      custody_status, urgency, critical_date_type, critical_date,
      services_requested, investigative_objective, consent_version, source,
      client_hash, retention_review_at
    ) VALUES (?, ?, ?, ?, 'new', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'attorney-intake', ?, ?)`)
      .bind(
        id, reference, now, now,
        attorneyFirstName, attorneyLastName, firmName, email, phone,
        submitterRole, preferredContact, timeZone, bestContactTime,
        barJurisdiction, barNumber, clientName, knownAliases, matterCaption,
        caseNumber, courtJurisdiction, prosecutingAgency, relatedParties,
        custodyStatus, urgency, criticalDateType, criticalDate,
        JSON.stringify(services), investigativeObjective, CONSENT_VERSION,
        hash, retentionReviewAt,
      ).run();

    return Response.json({
      referenceCode: reference,
      message: "Your attorney intake has been received for conflict screening and scheduling review.",
    }, { status: 201 });
  } catch {
    return Response.json({ message: "We could not submit the intake right now. Please try again shortly." }, { status: 500 });
  }
}
