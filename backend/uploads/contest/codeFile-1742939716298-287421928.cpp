#include <iostream>
#include <queue>
#include <vector>

using namespace std;

struct Node {
    int x, y, dist;
};

bool isValid(int x, int y, int rows, int cols, vector<vector<int>>& maze, vector<vector<bool>>& visited) {
    return (x >= 0 && y >= 0 && x < rows && y < cols && maze[x][y] != 1 && !visited[x][y]);
}

int shortestPath(vector<vector<int>>& maze, pair<int, int> start, pair<int, int> end) {
    int rows = maze.size(), cols = maze[0].size();
    vector<vector<bool>> visited(rows, vector<bool>(cols, false));
    queue<Node> q;
    q.push({start.first, start.second, 0});
    visited[start.first][start.second] = true;

    int dx[] = {0, 1, 0, -1};
    int dy[] = {1, 0, -1, 0};

    while (!q.empty()) {
        Node curr = q.front();
        q.pop();

        if (curr.x == end.first && curr.y == end.second) 
            return curr.dist;

        for (int i = 0; i < 4; i++) {
            int nx = curr.x + dx[i], ny = curr.y + dy[i];
            if (isValid(nx, ny, rows, cols, maze, visited)) {
                q.push({nx, ny, curr.dist + 1});
                visited[nx][ny] = true;
            }
        }
    }

    return -1;  // No path found
}

int main() {
    vector<vector<int>> maze = {
        {0, 0, 1, 0, 2},
        {0, 0, 1, 0, 1},
        {1, 0, 0, 0, 1},
        {0, 1, 1, 0, 0}
    };

    pair<int, int> start = {0, 0};  // Start Position
    pair<int, int> end = {0, 4};    // End Position

    cout << "Shortest Path Length: " << shortestPath(maze, start, end) << endl;
    return 0;
}
