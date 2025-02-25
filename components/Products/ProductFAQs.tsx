export function ProductFAQs() {
  const faqs = [
    {
      question: "What material is this t-shirt made of?",
      answer:
        "The t-shirt is made from a premium blend of cotton and polyester, ensuring both comfort and durability.",
    },
    {
      question: "How does the sizing run?",
      answer:
        "The t-shirt follows standard sizing. For a relaxed fit, we recommend ordering your usual size. For a more fitted look, consider sizing down.",
    },
    {
      question: "Is the graphic print durable?",
      answer:
        "Yes, we use high-quality screen printing techniques that ensure the graphic remains vibrant and intact even after multiple washes.",
    },
    {
      question: "What's the best way to care for this t-shirt?",
      answer:
        "We recommend machine washing in cold water and tumble drying on low. For best results, wash inside out and avoid using bleach.",
    },
  ];

  return (
    <div className="space-y-6">
      {faqs.map((faq, i) => (
        <div key={i} className="border-b pb-6 last:border-0">
          <h4 className="font-medium">{faq.question}</h4>
          <p className="mt-2 text-muted-foreground">{faq.answer}</p>
        </div>
      ))}
    </div>
  );
}
