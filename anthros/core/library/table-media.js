/**
 * MASTER: Table Media (TM-01)
 * A 50/50 split bordered card with a data table and an image.
 */
export default function MasterTableMedia(slots) {
    return `
    <div class="tm-data-card">
        <!-- LEFT COLUMN -->
        <div class="tm-left">
            ${slots.table || ''}
            ${slots.note || ''}
        </div>

        <!-- RIGHT COLUMN -->
        <div class="tm-right">
            ${slots.media || ''}
        </div>
    </div>
  `;
}
