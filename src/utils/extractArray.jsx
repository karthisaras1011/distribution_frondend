export const extractArray = (res) => {
  if (!res || !res.data) return [];

  const d = res.data;

  return (
    (Array.isArray(d.company) && d.company) ||
    (Array.isArray(d)) ||
    (Array.isArray(d.companies) && d.companies) ||
    (Array.isArray(d.data) && d.data) ||
    []
  );
};
