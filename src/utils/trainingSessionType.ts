/** Match API `session_type` to UI bucket (calendar uses the same rules). */
export function sessionTypeFromApi(raw: string | null | undefined): "Training" | "MATrX" {
  return /^matrx$/i.test((raw || "").trim()) ? "MATrX" : "Training";
}
