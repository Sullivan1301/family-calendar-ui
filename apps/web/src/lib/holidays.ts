export interface Holiday {
  date: string;
  localName: string;
  name: string;
}

export async function getMadagascarHolidays(year: number): Promise<Holiday[]> {
  const holidays: Holiday[] = [
    { date: `${year}-01-01`, localName: "Jour de l'an", name: "New Year's Day" },
    { date: `${year}-03-08`, localName: "Journée de la femme", name: "International Women's Day" },
    { date: `${year}-03-29`, localName: "Commémoration des martyrs de 1947", name: "Martyrs' Day" },
    { date: `${year}-05-01`, localName: "Fête du Travail", name: "Labour Day" },
    { date: `${year}-05-25`, localName: "Journée de l'Afrique", name: "Africa Day" },
    { date: `${year}-06-26`, localName: "Fête de l'Indépendance", name: "Independence Day" },
    { date: `${year}-08-15`, localName: "Assomption", name: "Assumption Day" },
    { date: `${year}-11-01`, localName: "Toussaint", name: "All Saints' Day" },
    { date: `${year}-12-25`, localName: "Noël", name: "Christmas Day" },
  ];

  if (year === 2026) {
    holidays.push({ date: "2026-04-06", localName: "Lundi de Pâques", name: "Easter Monday" });
    holidays.push({ date: "2026-05-14", localName: "Ascension", name: "Ascension Day" });
    holidays.push({ date: "2026-05-25", localName: "Lundi de Pentecôte", name: "Whit Monday" });
  }

  return holidays;
}
