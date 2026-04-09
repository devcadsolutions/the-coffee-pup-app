import { HelpCircle, MessageCircle } from 'lucide-react';

export default function SupportView() {
  const faqs = [
    { q: 'How to order?', a: 'Add items to cart, checkout, and send payment screenshot.' },
    { q: 'Delivery time?', a: 'Usually 30-60 minutes within Chateau Elysee.' },
    { q: 'Payment concerns?', a: 'Please contact us directly if you have issues.' },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-surface-container-low">
            <h4 className="font-bold text-primary">{faq.q}</h4>
            <p className="text-xs text-on-surface-variant">{faq.a}</p>
          </div>
        ))}
      </div>
      <button className="w-full flex items-center justify-center gap-2 bg-primary text-white py-4 rounded-full font-bold">
        <MessageCircle size={20} /> Contact Support
      </button>
    </div>
  );
}
