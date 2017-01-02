var fs = require('fs');
var colors = ['Black','Blue','Bronze','Brilliant','Bodacious','Bold',
 'Camouflage','Crimson','Coral','Creepy','Calm','Charcoal',
 'Dark','Dangerous','Delightful','Dapper','Dashing','Darling',
 'Silver','Scarlet','Sage','Shocking','Simple','Sapphire',
 'White','Whimsical','Whine','Winter','Wicked','Wacky',
 'Maroon','Mulberry','Magical','Mystic','Muddy','Mint',
 'Red','Rose','Royal','Raspberry','Radical','Ruby',
 'Purple','Pink','Paisely','Pearl','Perfect','Peach',
 'Fuchsia','French','Fuzzy','Floral','Flying','Fiery',
 'Green','Glossy','Gold','Ginger','Groovy','Grape',
 'Lime','Lazy','Lavender','Lemon','Lively','Leaping',
 'Olive','Orange','Onyx','Outrageous','Original','Orchid',
 'Navy','Neon','Nifty','Navajo','Noisy','Nice',
 'Teal','Topaz','Tropical','Turquoise','Trusty','Tall',
 'Aqua','Amber','Amethyst','Awesome','Amazing','Auburn'];

var animals = {
  'A': ['Ape','Anteater','Antelope','Armadillo','Alligator','Albatros','Alpaca'],
  'B': ['Baboon','Badger','Bat','Bison','Boar','Butterfly','Bobcat','Bandicoot'],
  'C': ['Cat','Cougar','Crab','Camel','Chicken','Cobra','Cow','Crane'],
  'D': ['Dog', 'Dolphin', 'Donkey', 'Deer', 'Dingo', 'Dragon', 'Duck'],
  'F': ['Falcon','Finch','Ferret','Fox','Frog','Flamingo','Foal'],
  'G': ['Gazelle','Gerbil','Giraffe','Goat','Goose','Gorilla','Grasshopper'],
  'L': ['Lark','Lemur','Leopard','Lion','Llama','Lobster','Locust'],
  'M': ['Magpie','Mallard','Manatee','Moth','Mole','Mongoose','Monkey','Moose','Mouse'],
  'N': ['Narwhal','Newt','Nightingale','Nighthawk','Nautilus','Nuthatch','Needlefish'],
  'O': ['Octopus','Okapi','Orca','Ostrich','Otter','Owl','Ocelot','Oriole'],
  'P': ['Panther','Parrot','Pelican','Penguin','Pig','Puma','Pony','Porcupine','Platypus'],
  'R': ['Rabbit','Raccoon','Rat','Raven','Reindeer','Rhino','Roadrunner'],
  'S': ['Salamander','Seahorse','Sheep','Skunk','Sloth','Snail','Spider','Squirrel','Swan'],
  'T': ['Tapir','Tiger','Toad','Turkey','Turtle','Tucan','Trout','Tarantula'],
  'W': ['Wallaby','Walrus','Weasel','Whale','Wolf','Wolverine','Wombat']
}


Array.prototype.shuffle = function() {
  let m = this.length, i;
  while (m) {
    i = (Math.random() * m--) >>> 0;
    [this[m], this[i]] = [this[i], this[m]]
  }
  return this;
}

var combos = [];
for (var i=0;i < colors.length; i++) {
  var c = colors[i], ch = c.charAt(0), ans = animals[ch];
  for (var d=0;d < ans.length;d++) {
    var name = c + ' ' + ans[d];
    combos.push(name);
  }
}

combos.shuffle();
combos.shuffle();
combos.reverse();
combos.shuffle();
combos.shuffle();



var sql = fs.createWriteStream('./package_names.sql');
for (var i=0;i<combos.length;i++) {
  sql.write('INSERT INTO package_names VALUES(NULL,"' + combos[i] + '");\n');
}
sql.end();
console.log('%s combinations', combos.length);