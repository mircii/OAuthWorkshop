const Fish = require('../models/fishModel');

const fishData = [
  new Fish(1, 'Clownfish', 'Amphiprioninae', 'Coral reefs', 11, false),
  new Fish(2, 'Great White Shark', 'Carcharodon carcharias', 'Open ocean', 600, true),
  new Fish(3, 'Atlantic Salmon', 'Salmo salar', 'Freshwater and saltwater', 75, false),
  new Fish(4, 'Bluefin Tuna', 'Thunnus thynnus', 'Open ocean', 250, true)
];

module.exports = fishData;