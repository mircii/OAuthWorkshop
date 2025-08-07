const Fish = require('../models/fishModel');

const fishData = [
  new Fish(1, 'Clownfish', 'Amphiprioninae', 'Coral reefs', 11, false, 'client_id_1'),
  new Fish(2, 'Great White Shark', 'Carcharodon carcharias', 'Open ocean', 600, true, 'client_id_2'),
  new Fish(3, 'Atlantic Salmon', 'Salmo salar', 'Freshwater and saltwater', 75, false, 'client_id_3'),
  new Fish(4, 'Bluefin Tuna', 'Thunnus thynnus', 'Open ocean', 250, true, 'client_id_4'),
  new Fish(5, 'Dani Mocanu', 'Cateret', 'In tari straine', 190, true, 'Sebi'),
];

module.exports = fishData;