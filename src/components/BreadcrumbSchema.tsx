import { useEffect } from "react";

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
}

const BreadcrumbSchema: React.FC<BreadcrumbSchemaProps> = ({ items }) => {
  useEffect(() => {
    const breadcrumbList = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.name,
        "item": item.url
      }))
    };

    let script = document.querySelector('script[data-breadcrumb-schema="true"]');
    if (!script) {
      script = document.createElement("script");
      script.setAttribute("type", "application/ld+json");
      script.setAttribute("data-breadcrumb-schema", "true");
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(breadcrumbList);

    return () => {
      // Cleanup on unmount
      const existingScript = document.querySelector('script[data-breadcrumb-schema="true"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [items]);

  return null;
};

export default BreadcrumbSchema;
