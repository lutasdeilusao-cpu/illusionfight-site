export const SEASON_ONE_DROPS = [
  ['2026-11-30', 'LDI 1, 2, 3', 'LDI 1, 2', 'LDI 1'],
  ['2026-12-14', 'LDI 4', 'LDI 3', 'LDI 2'],
  ['2026-12-28', 'LDI 5', 'LDI 4', 'LDI 3'],
  ['2027-01-11', 'LDI 6', 'LDI 5', 'LDI 4'],
  ['2027-01-25', 'Conto A', 'LDI 6', 'LDI 5'],
  ['2027-02-08', 'Sombras 1, 2, 3', 'Sombras 1, 2', 'LDI 6 + Sombras 1'],
  ['2027-02-22', 'Sombras 4, 5, 6', 'Sombras 3, 4', 'Sombras 2, 3'],
  ['2027-03-08', 'LDI 7', '—', '—'],
  ['2027-03-22', 'LDI 8', 'LDI 7', '—'],
  ['2027-04-05', 'LDI 9', 'LDI 8', 'LDI 7'],
  ['2027-04-19', 'LDI 10', 'LDI 9', 'LDI 8'],
  ['2027-05-03', 'LDI 11', 'LDI 10', 'LDI 9'],
  ['2027-05-17', 'LDI 12', 'LDI 11', 'LDI 10'],
  ['2027-05-31', 'Conto B', 'LDI 12', 'LDI 11'],
  ['2027-06-14', 'Cinzas 1, 2, 3', 'Sombras 5, 6', 'LDI 12 + Sombras 4, 5'],
  ['2027-06-28', 'Conto C', 'Cinzas 1, 2', 'Sombras 6'],
  ['2027-07-12', 'LDI 13', '—', '—'],
  ['2027-07-26', 'LDI 14', 'LDI 13', '—'],
  ['2027-08-09', 'LDI 15', 'LDI 14', 'LDI 13'],
  ['2027-08-23', 'LDI 16', 'LDI 15', 'LDI 14'],
  ['2027-09-06', 'LDI 17', 'LDI 16', 'LDI 15'],
  ['2027-09-20', 'LDI 18', 'LDI 17', 'LDI 16'],
  ['2027-10-04', 'Conto D', 'LDI 18', 'LDI 17'],
  ['2027-10-18', 'Cinzas 4, 5', 'Cinzas 3', 'LDI 18 + Cinzas 1, 2'],
  ['2027-11-01', 'Cinzas 6', 'Cinzas 4, 5', 'Cinzas 3, 4'],
  ['2027-11-15', 'Conto E', 'Cinzas 6', 'Cinzas 5'],
  ['2027-11-29', 'Recap T1', 'Recap T1', 'Cinzas 6 + Recap T1'],
].map(([date, subscriber, account, publicRelease], index) => ({
  number: index + 1, date, subscriber, account, public: publicRelease,
}))

export const SEASON_ONE_COMPLETION = [
  ['ldi', '2027-10-18', '2027-10-04', '2027-09-20'],
  ['shadows', '2027-06-28', '2027-06-14', '2027-02-22'],
  ['ashes', '2027-11-29', '2027-11-15', '2027-11-01'],
]

