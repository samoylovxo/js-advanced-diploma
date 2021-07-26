/* eslint-disable linebreak-style */
/* eslint-disable no-plusplus */

/**
 * Generates random characters
 *
 * @param allowedTypes iterable of classes
 * @param maxLevel max character level
 * @returns Character type children (ex. Magician, Bowman, etc)
 */
export function* characterGenerator(allowedTypes, maxLevel) {
  // TODO: write logic here

  for (let i = 0; i < allowedTypes.length; i++) {
    yield new allowedTypes[i](maxLevel);
  }
}

export function randomSortArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

export function generateTeam(allowedTypes, maxLevel, characterCount) {
  // TODO: write logic here
  const team = [];

  for (let i = 0; i < allowedTypes.length; i++) {
    team.push(new allowedTypes[i](maxLevel));
  }

  return randomSortArray(team).splice(0, characterCount);
}
