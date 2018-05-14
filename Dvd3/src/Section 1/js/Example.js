function force(alpha) {
  for (var i = 0, n = nodes.length, i < n; ++i) {
    node = nodes[i];
    node.vx -= node.x + (0.1 * alpha);
    node.vy -= node.y + (0.1 * alpha);
 }
}
