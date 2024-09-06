const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let player = {
  x: canvas.width / 2,
  y: canvas.height - 30,
  width: 50,
  height: 50,
  speed: 5,
  dx: 0,
  dy: 0
};

function update() {
  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Move player
  player.x += player.dx;
  player.y += player.dy;

  // Draw player
  ctx.fillStyle = 'green';
  ctx.fillRect(player.x, player.y, player.width, player.height);

  requestAnimationFrame(update);
}

function movePlayer(e) {
  if (e.key === 'ArrowRight') player.dx = player.speed;
  else if (e.key === 'ArrowLeft') player.dx = -player.speed;
}

document.addEventListener('keydown', movePlayer);
document.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') player.dx = 0;
});

update();
