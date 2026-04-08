# MOOOD.STUDIO – BRANDING PROPOSAL ARCHITECTURE LAWS

## LEY 0: PROTECCIÓN DE INTEGRIDAD BINARIA
> [!CAUTION]
> **NUNCA usar comandos del sistema operativo (`mv`, `cp`, `rm`, `write_to_file`, `replace_file_content`) sobre archivos con extensión `.pen`.** Los archivos de Pencil son binarios encriptados y cualquier manipulación externa, por pequeña que sea, corromperá el archivo de forma irreversible.
>
> **La única forma permitida de operar archivos .pen es:**
> 1. Exportar manualmente desde el editor Pencil (`File > Duplicate`).
> 2. Crear una copia de un nodo/frame vía `mcp_pencil_batch_design`.
> 3. Abrir el documento mediante el modelo `mcp_pencil_open_document`.
>
> El Agente tiene PROHIBIDO intentar renombrar o mover archivos .pen directamente.


This law governs the creation of high-fidelity, editorial proposals for Moood Studio. All future propositions must manifest from the **`OFFICIAL-MOOOD-PROPOSAL-MASTER.pen`** to ensure absolute systemic integrity.

## I. STRUCTURAL RIGOR (Portrait A4)
1. **Dimensions**: Every page MUST strictly adhere to Portrait A4 proportions (**900x1272px**).
2. **Master Source**: NEVER create a proposal from scratch. ALWAYS clone the Master source:
   `C("OFFICIAL-MOOOD-PROPOSAL-MASTER.pen", document, {name: "[CLIENT_NAME]-proposal.pen"})`
3. **Margins**: Maintain a rigid padding of **80px** on all content slides to ensure adequate visual breath.
4. **Layout**: Preserve the **5-Slide sequence**:
   01. The Vision | 02. The Diagnosis | 03. The Roadmap | 04. The Brand Toolkit | 05. Commercial Terms

## II. TYPOGRAPHIC PURITY (Helvetica Now Display)
1. **System**: Only use **Helvetica Now Display** (Light, Regular, Medium, Bold) as established in `assets/fonts/`.
2. **Hierarchy**:
   - **Main Headline (H2)**: 56px | 300 Weight | 1.1 LineHeight.
   - **Sub Headline (H3)**: 32px | 300 Weight | 1.2 LineHeight.
   - **Body Copy**: 20px | 300 Weight | 1.7 LineHeight | #000000CC (80% opacity).
   - **Logistics Labels**: 11px | 700 Weight | 1.5 LetterSpacing | #00000055.

## III. DATA RECOVERY PROTOCOL (URL Query)
1. **Email Capture**: Every proposal link sent to a client MUST include the following query parameters:
   `?client_email=xxx@xx.com&client_name=Name`
2. **Approval Function**: The "Approve Proposal" button MUST invoke the `approveProposal()` function, extracting URL data to send automated confirmations to both Alberto and the Client.

## IV. SUCCESS EXPERIENCE (Thank You Page)
1. Every proposal must conclude by redirecting to **`quotes/thank-you.html`**.
2. Centered content, Fixed top-left logo vinculated to `/index.html`.

## V. PDF EXPORT PROTOCOL
1. **Format**: All proposals must be exported as **PDFs** using the Master proportions.
2. **Naming**: The final document MUST be named: `[client_name]-quote.pdf`.
3. **Download Link**: The HTML proposal must feature a direct download link to this specific PDF.

---
*Signed, Alberto Contreras – Strategic Office*
