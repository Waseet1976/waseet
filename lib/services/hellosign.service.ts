/**
 * hellosign.service.ts
 * Intégration HelloSign (Dropbox Sign) pour la signature électronique des contrats.
 * Note : hellosign-sdk est déprécié — migrer vers @dropbox/sign si nécessaire.
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const HelloSign = require("hellosign-sdk");

const client = new HelloSign({
  key: process.env.HELLOSIGN_API_KEY ?? "",
});

// ── Types ──────────────────────────────────────────────────────────────────────

export type HelloSignContractType = "MANDATE" | "COMPROMISE" | "DEED" | "APPORTEUR_AGREEMENT";

export interface SignatureRequest {
  contractId:        string;
  propertyId:        string;
  signers: Array<{
    name:  string;
    email: string;
    role:  string;
  }>;
  contractType:      HelloSignContractType;
  propertyReference: string;
  propertyAddress:   string;
}

export interface SignatureResult {
  signatureRequestId: string;
  signingUrls: Array<{
    signerId:   string;
    signingUrl: string;
  }>;
}

export interface SignatureStatus {
  isComplete: boolean;
  signatures: Array<{
    email:    string;
    status:   string;
    signedAt: number | null;
  }>;
}

// ── Envoyer pour signature ─────────────────────────────────────────────────────

export async function sendForSignature(params: SignatureRequest): Promise<SignatureResult> {
  const templateId = getTemplateId(params.contractType);

  const response = await client.signatureRequest.sendWithTemplate({
    template_id: templateId,
    subject:     getContractSubject(params.contractType, params.propertyReference),
    message:     getContractMessage(params.contractType),
    signers:     params.signers.map((signer) => ({
      email_address: signer.email,
      name:          signer.name,
      role:          signer.role,
    })),
    custom_fields: [
      { name: "property_reference", value: params.propertyReference },
      { name: "property_address",   value: params.propertyAddress },
      { name: "date",               value: new Date().toLocaleDateString("fr-BE") },
    ],
    metadata: {
      contract_id: params.contractId,
      property_id: params.propertyId,
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    test_mode: (process.env.NODE_ENV !== "production" ? 1 : 0) as any,
  });

  const req = response.signature_request;

  return {
    signatureRequestId: req.signature_request_id,
    signingUrls:        (req.signatures ?? []).map((sig: Record<string, string>) => ({
      signerId:   sig.signer_email_address,
      signingUrl: sig.sign_url ?? "",
    })),
  };
}

// ── Récupérer le statut ────────────────────────────────────────────────────────

export async function getSignatureStatus(signatureRequestId: string): Promise<SignatureStatus> {
  const response = await client.signatureRequest.get(signatureRequestId);
  const req      = response.signature_request;

  return {
    isComplete: req.is_complete,
    signatures: (req.signatures ?? []).map((sig: Record<string, unknown>) => ({
      email:    sig.signer_email_address as string,
      status:   sig.status_code as string,
      signedAt: sig.signed_at as number | null,
    })),
  };
}

// ── Télécharger le PDF signé ───────────────────────────────────────────────────

export async function downloadSignedDocument(signatureRequestId: string): Promise<Buffer> {
  // hellosign-sdk retourne un stream — on le convertit en Buffer
  const stream = await client.signatureRequest.download(signatureRequestId, {
    file_type: "pdf",
  });

  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on("data",  (chunk: Buffer) => chunks.push(chunk));
    stream.on("end",   () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}

// ── Annuler ───────────────────────────────────────────────────────────────────

export async function cancelSignatureRequest(signatureRequestId: string): Promise<void> {
  await client.signatureRequest.cancel(signatureRequestId);
}

// ── Privé : Helpers ──────────────────────────────────────────────────────────

function getTemplateId(contractType: HelloSignContractType): string {
  const templates: Record<HelloSignContractType, string> = {
    MANDATE:             process.env.HELLOSIGN_TEMPLATE_MANDATE      ?? "",
    COMPROMISE:          process.env.HELLOSIGN_TEMPLATE_COMPROMISE   ?? "",
    DEED:                process.env.HELLOSIGN_TEMPLATE_DEED         ?? "",
    APPORTEUR_AGREEMENT: process.env.HELLOSIGN_TEMPLATE_APPORTEUR   ?? "",
  };
  const id = templates[contractType];
  if (!id) throw new Error(`Template HelloSign manquant pour ${contractType}`);
  return id;
}

function getContractSubject(type: HelloSignContractType, reference: string): string {
  const subjects: Record<HelloSignContractType, string> = {
    MANDATE:             `Mandat de vente — ${reference}`,
    COMPROMISE:          `Compromis de vente — ${reference}`,
    DEED:                `Acte de vente — ${reference}`,
    APPORTEUR_AGREEMENT: `Convention apporteur d'affaires — ${reference}`,
  };
  return subjects[type];
}

function getContractMessage(type: HelloSignContractType): string {
  const messages: Record<HelloSignContractType, string> = {
    MANDATE:             "Veuillez signer ce mandat de vente pour confirmer votre accord.",
    COMPROMISE:          "Veuillez signer ce compromis de vente. Attention : cette signature engage juridiquement les deux parties.",
    DEED:                "Veuillez signer cet acte de vente définitif.",
    APPORTEUR_AGREEMENT: "Veuillez signer cette convention d'apporteur d'affaires Waseet.",
  };
  return messages[type];
}
