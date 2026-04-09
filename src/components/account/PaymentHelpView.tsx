import { CreditCard, Camera } from 'lucide-react';

export default function PaymentHelpView() {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-surface-container-low">
        <h3 className="font-bold text-primary mb-4 flex items-center gap-2"><CreditCard size={20} /> How to Pay</h3>
        <ol className="text-sm text-on-surface-variant list-decimal list-inside space-y-2">
          <li>Select your payment method (GCash, Maya, Bank Transfer).</li>
          <li>Scan the QR code provided after checkout.</li>
          <li>Send the payment.</li>
          <li>Take a screenshot of the confirmation.</li>
          <li>Send the screenshot to our Messenger.</li>
        </ol>
        <div className="mt-4 flex items-center gap-2 p-3 bg-surface-container-lowest rounded-xl">
          <Camera size={20} className="text-primary" />
          <p className="text-xs text-on-surface-variant italic">Don't forget to send the screenshot!</p>
        </div>
      </div>
    </div>
  );
}
