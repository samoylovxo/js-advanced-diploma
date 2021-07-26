export function calcTileType(index, boardSize) {
  // TODO: write logic here
  if (index < boardSize - 1 && index > 0) {
    return 'top';
  }

  if (index === 0) {
    return 'top-left';
  }

  if (index === boardSize - 1) {
    return 'top-right';
  }

  if (index === boardSize ** 2 - 8) {
    return 'bottom-left';
  }

  if (index === boardSize ** 2 - 1) {
    return 'bottom-right';
  }

  if ((index / 2) % 4 === 0 && index !== boardSize ** 2 - 8) {
    return 'left';
  }

  if (index % 8 === 7 && index !== boardSize ** 2 - 1) {
    return 'right';
  }

  if (index > boardSize ** 2 - 8 && index !== boardSize ** 2 - 1) {
    return 'bottom';
  }

  return 'center';
}

export function calcHealthLevel(health) {
  if (health < 15) {
    return 'critical';
  }

  if (health < 50) {
    return 'normal';
  }

  return 'high';
}
