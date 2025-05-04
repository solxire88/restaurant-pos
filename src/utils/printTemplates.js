// src/utils/printTemplates.js
export function customerReceiptHTML(orderItems) {
    const total = orderItems.reduce((sum, i) => sum + i.quantity * i.price, 0).toFixed(2);
    return `
      <html><body style="font-family:sans-serif; padding:20px;">
        <h2>Customer Receipt</h2>
        <table style="width:100%; border-collapse: collapse;">
          ${orderItems.map(i => `
            <tr>
              <td>${i.quantity}× ${i.name}</td>
              <td style="text-align:right">$${(i.price * i.quantity).toFixed(2)}</td>
            </tr>
          `).join('')}
          <tr style="border-top:1px dashed #888;">
            <td><strong>Total</strong></td>
            <td style="text-align:right"><strong>$${total}</strong></td>
          </tr>
        </table>
      </body></html>
    `;
  }
  
  export function chefTicketHTML(orderItems) {
    return `
      <html><body style="font-family:monospace; padding:10px;">
        <h3>Kitchen Ticket</h3>
        <ul>
          ${orderItems.map(i => `<li>${i.quantity}× ${i.name}</li>`).join('')}
        </ul>
      </body></html>
    `;
  }
  