/**
 * ---Author---
 * Lexipit3268
 * TranTrong Fuc
 * DucFat
 * DoanTaiLoc
 * 
 */
const colors = {
    red: "#ef476f",
    blue: "#03a9f4",
    green: "#52b788",
    gray: "#5c677d",
}
async function performTraversal() {
    toggleInputs(true); // Khóa input khi thuật toán chạy
    resetTraversal();   // Reset trạng thái đồ thị

    const traversalType = document.getElementById("traversalType").value;
    const startNode = parseInt(document.getElementById("startNodeInput").value);

    if (traversalType === "bfs") {
        await performBFS(startNode);
    } else if (traversalType === "dfs") {
        await performDFS(startNode);
    } else if (traversalType === "dfs-recursion") {
        performDFSRecursion(startNode);
    } else if (traversalType === "mooreDijkstra") {
        await mooreDijkstra();
    } else if (traversalType === "bipartite") {
        await checkBipartite();
    }

    toggleInputs(false); // Mở lại input sau khi chạy xong
}


function toggleInputs(disable) {
    document.getElementById("graphInput").disabled = disable;
    document.getElementById("creatGraph").disabled = disable;
    document.getElementById("traversalType").disabled = disable;
    document.getElementById("startNodeInput").disabled = disable;
    document.getElementById("endNodeInput").disabled = disable;
    document.getElementById("speedSlider").disabled = disable;
}

function resetTraversal() {
    // Reset màu của tất cả đỉnh
    cy.nodes().style("background-color", "");

    // Reset màu của tất cả cung (edges) về mặc định
    cy.edges().style("line-color", "black");

    // Reset thứ tự đã duyệt
    document.getElementById("visitedOrder").innerText = "";
}

function enableInputs() {
    // Enable lại các thành phần nhập liệu khi duyệt xong
    toggleInputs(false);
    console.log("Traversal completed successfully.");
}

async function performBFS(startNode) {
    const inputText = document.getElementById('graphInput').value.trim();
    const lines = inputText.split('\n');
    let graph = {};

    const graphType = document.querySelector('input[name="graphType"]:checked').value;
    lines.forEach(line => {
        const edgeData = line.split(' ').map(Number);
        if (edgeData.length >= 2) {
            const source = edgeData[0];
            const target = edgeData[1];

            if (!graph[source]) graph[source] = [];
            if (!graph[target]) graph[target] = [];

            if (graphType === 'directed') {
                graph[source].push(target);
            } else if (graphType === 'undirected') {
                graph[source].push(target);
                graph[target].push(source);
            }
        }
    });

    await bfs(graph, startNode);  // Đợi BFS hoàn tất
}

async function bfs(graph, start) {
    const queue = [start];
    const visited = new Set();
    const result = []; // Mảng lưu thứ tự duyệt
    const visitedEdges = new Set();
    const delay = parseInt(document.getElementById('speedSlider').value);

    async function visitNext() {
        if (queue.length === 0) {
            return;
        }

        const vertex = queue.shift();

        if (!visited.has(vertex)) {
            visited.add(vertex);
            result.push(vertex);

            cy.$(`#${vertex}`).style('background-color', colors.red);

            document.getElementById('visitedOrder').innerText = result.join(' - ');

            const neighborsToAdd = [];
            if (graph[vertex]) {
                for (const neighbor of graph[vertex]) {
                    if (!visited.has(neighbor)) {
                        neighborsToAdd.push(neighbor);
                    }
                }
            }


            if (neighborsToAdd.length > 1) {
                neighborsToAdd.sort((a, b) => a - b);
            }

            queue.push(...neighborsToAdd);
        }

        if (queue.length > 0) {
            await new Promise(resolve => setTimeout(resolve, delay));
            await visitNext();
        }
    }

    await visitNext();
}

async function performDFS(startNode) {
    const inputText = document.getElementById('graphInput').value.trim();
    const lines = inputText.split('\n');
    let graph = {};

    const graphType = document.querySelector('input[name="graphType"]:checked').value;
    lines.forEach(line => {
        const edgeData = line.split(' ').map(Number);
        if (edgeData.length >= 2) {
            const source = edgeData[0];
            const target = edgeData[1];

            if (!graph[source]) graph[source] = [];
            if (!graph[target]) graph[target] = [];

            if (graphType === 'directed') {
                graph[source].push(target);
            } else if (graphType === 'undirected') {
                graph[source].push(target);
                graph[target].push(source);
            }
        }
    });

    await dfs(graph, startNode);
}

async function dfs(graph, start) {
    const stack = [start];
    const visited = new Set();
    const result = [];
    const visitedEdges = new Set();
    const delay = parseInt(document.getElementById('speedSlider').value);

    async function visitNext() {
        if (stack.length === 0) {
            return;
        }

        const vertex = stack.pop();

        if (!visited.has(vertex)) {
            visited.add(vertex);
            result.push(vertex);

            cy.$(`#${vertex}`).style('background-color', colors.blue);

            // Cập nhật thứ tự đã duyệt
            document.getElementById('visitedOrder').innerText = result.join(' - ');

            // Thêm các đỉnh kề chưa duyệt vào ngăn xếp
            const neighborsToAdd = [];
            if (graph[vertex]) {
                for (const neighbor of graph[vertex]) {
                    if (!visited.has(neighbor)) {
                        neighborsToAdd.push(neighbor);
                    }
                }
            }

            // Nếu số lượng đỉnh kề được thêm vào lớn hơn 1, sắp xếp chúng
            if (neighborsToAdd.length > 1) {
                neighborsToAdd.sort((a, b) => a - b); // Sắp xếp tăng dần
            }

            // Thêm các đỉnh kề đã sắp xếp vào ngăn xếp
            stack.push(...neighborsToAdd);
        }

        // Duyệt đỉnh tiếp theo sau một khoảng thời gian trễ
        if (stack.length > 0) {
            await new Promise(resolve => setTimeout(resolve, delay)); // Chờ trong thời gian delay
            await visitNext(); // Tiếp tục duyệt
        }
    }

    await visitNext(); // Chờ khi DFS hoàn tất
}

function performDFSRecursion(startNode) {
    const inputText = document.getElementById('graphInput').value.trim();
    const lines = inputText.split('\n');
    let graph = {};

    const graphType = document.querySelector('input[name="graphType"]:checked').value;
    lines.forEach(line => {
        const edgeData = line.split(' ').map(Number);
        if (edgeData.length >= 2) {
            const source = edgeData[0];
            const target = edgeData[1];

            if (!graph[source]) graph[source] = [];
            if (!graph[target]) graph[target] = [];

            if (graphType === 'directed') {
                graph[source].push(target);
            } else if (graphType === 'undirected') {
                graph[source].push(target);
                graph[target].push(source);
            }
        }
    });

    dfsRecursion(graph, startNode, new Set(), parseInt(document.getElementById('speedSlider').value), () => {
        enableInputs(); // Enable inputs khi DFS đệ quy xong
    });
}

function dfsRecursion(graph, vertex, visited = new Set(), delay, callback) {
    if (visited.has(vertex)) return;

    visited.add(vertex);

    setTimeout(() => {
        cy.$(`#${vertex}`).style('background-color', colors.green);
        let visitedOrder = document.getElementById('visitedOrder').innerText;
        if (visitedOrder.length > 0) {
            visitedOrder += ' - ';
        }
        visitedOrder += vertex;
        document.getElementById('visitedOrder').innerText = visitedOrder;

        if (graph[vertex]) {
            const neighbors = graph[vertex].slice().sort((a, b) => a - b);
            let index = 0;

            function visitNextNeighbor() {
                if (index < neighbors.length) {
                    const neighbor = neighbors[index++];
                    if (!visited.has(neighbor)) {
                        dfsRecursion(graph, neighbor, visited, delay, visitNextNeighbor);
                    } else {
                        visitNextNeighbor();
                    }
                } else if (callback) {
                    callback();
                }
            }
            visitNextNeighbor();
        } else if (callback) {
            callback();
        }
    }, delay);
}

async function mooreDijkstra() {
    const startNode = parseInt(document.getElementById("startNodeInput").value);
    const endNode = parseInt(document.getElementById("endNodeInput").value);
    const visitedOrder = document.getElementById("visitedOrder");
    const speedSlider = document.getElementById("speedSlider");
    const graphType = document.querySelector('input[name="graphType"]:checked').value;

    if (isNaN(startNode) || isNaN(endNode)) {
        visitedOrder.innerHTML = "Vui lòng nhập đỉnh hợp lệ.";
        return;
    }

    const inputText = document.getElementById("graphInput").value.trim();
    const lines = inputText.split("\n");
    let graph = {};
    let allNodes = new Set();

    lines.forEach(line => {
        const [u, v, w] = line.split(" ").map(Number);
        if (!graph[u]) graph[u] = [];
        graph[u].push({ node: v, weight: w });

        // Cập nhật chiều ngược lại ( vô hướng lmao)
        if (graphType === 'undirected') {
            if (!graph[v]) graph[v] = [];
            graph[v].push({ node: u, weight: w });
        }

        allNodes.add(u);
        allNodes.add(v);
    });

    if (!allNodes.has(endNode) || !allNodes.has(startNode)) {
        visitedOrder.innerHTML = "Không có đường đi.";
        toggleInputs(false);
        return;
    }

    // Bảng khoảng cách và đường đi
    let dist = {};
    let prev = {};
    let queue = new MinHeap();
    let pathEdges = []; 

    allNodes.forEach(node => {
        dist[node] = Infinity;
        prev[node] = null;
    });

    dist[startNode] = 0;
    queue.push(startNode, 0);

    visitedOrder.innerHTML = "";
    toggleInputs(true);
    // Tô màu StartNode
    cy.getElementById(startNode.toString()).style("background-color", "#52b788");

    let found = false; 

    while (!queue.isEmpty()) {
        let { node: u, cost } = queue.pop();
        if (u === endNode) {
            found = true;
            // Tô màu endNode
            cy.getElementById(endNode.toString()).style("background-color", "#52b788");
            break;
        }

        if (u !== startNode) {
            // Tô màu các node xét duyệt
            cy.getElementById(u.toString()).style("background-color", "#ef476f");
        }

        visitedOrder.innerHTML += visitedOrder.innerHTML ? ` -> ${u}` : `${u}`;

        if (graph[u]) {
            for (let { node: v, weight } of graph[u]) {
                let newDist = dist[u] + weight;
                if (newDist < dist[v]) {
                    dist[v] = newDist;
                    prev[v] = u;
                    queue.update(v, newDist);
                }
            }
        }

        await new Promise(resolve => setTimeout(resolve, speedSlider.value));
    }

    if (found) {
        await highlightShortestPathEdges(prev, startNode, endNode, speedSlider.value);
        await reconstructPath(prev, startNode, endNode);
    } else {
        visitedOrder.innerHTML = "Không có đường đi.";
    }

    toggleInputs(false);
}

async function highlightShortestPathEdges(prev, startNode, endNode, delay) {
    let path = [];
    for (let at = endNode; at !== null; at = prev[at]) {
        path.push(at);
    }
    path.reverse();

    // Tô màu các cung theo đường đi
    for (let i = 1; i < path.length; i++) {
        let from = path[i - 1];
        let to = path[i];

        cy.edges().forEach(edge => {
            if ((edge.source().id() == from.toString() && edge.target().id() == to.toString()) ||
                (edge.source().id() == to.toString() && edge.target().id() == from.toString())) {
                edge.style("line-color", "#c9184a");
            }
        });

        await new Promise(resolve => setTimeout(resolve, delay));
    }
}


class MinHeap {
    constructor() {
        this.heap = [];
    }

    push(node, cost) {
        this.heap.push({ node, cost });
        this.heap.sort((a, b) => a.cost - b.cost);
    }

    pop() {
        return this.heap.shift();
    }

    isEmpty() {
        return this.heap.length === 0;
    }

    update(node, cost) {
        let found = this.heap.findIndex(item => item.node === node);
        if (found !== -1) {
            this.heap[found].cost = cost;
        } else {
            this.push(node, cost);
        }
        this.heap.sort((a, b) => a.cost - b.cost);
    }
}

async function reconstructPath(prev, startNode, endNode) {
    let path = [];
    for (let at = endNode; at !== null; at = prev[at]) {
        path.push(at);
    }
    path.reverse();

    document.getElementById("visitedOrder").innerHTML = "";

    for (let i = 0; i < path.length; i++) {
        let node = path[i];

        document.getElementById("visitedOrder").innerHTML += (i === 0) ? `${node}` : ` -> ${node}`;

        if (i > 0) {
            let from = path[i - 1];
            let to = node;
            //to mau cung duong di
            cy.edges().forEach(edge => {
                if (edge.source().id() == from && edge.target().id() == to) {
                    edge.style("line-color", "#c9184a");
                }
            });
        }
        await new Promise(resolve => setTimeout(resolve, document.getElementById("speedSlider").value));
    }
}

async function checkBipartite() {
    const inputText = document.getElementById('graphInput').value.trim();
    const lines = inputText.split('\n');
    let graph = {};

    const graphType = document.querySelector('input[name="graphType"]:checked').value;
    lines.forEach(line => {
        const edgeData = line.split(' ').map(Number);
        if (edgeData.length >= 2) {
            const source = edgeData[0];
            const target = edgeData[1];

            if (!graph[source]) graph[source] = [];
            if (!graph[target]) graph[target] = [];

            if (graphType === 'directed') {
                graph[source].push(target);
            } else if (graphType === 'undirected') {
                graph[source].push(target);
                graph[target].push(source);
            }
        }
    });
    const nodeCount = Object.keys(graph).length;
    const startNode = parseInt(document.getElementById('startNodeInput').value);

    if (startNode > nodeCount || startNode < 1) {
        document.getElementById('visitedOrder').innerText = "Nhập đỉnh bắt đầu hợp lệ.";
        return;
    }
    await bfsCheckBipartite(graph);
}

async function bfsCheckBipartite(graph) {
    const queue = [];
    const visited = new Set();
    const group = new Map();
    const delay = parseInt(document.getElementById('speedSlider').value);
    const startNode = parseInt(document.getElementById('startNodeInput').value);

    
    queue.push(startNode);
    visited.add(startNode);
    group.set(startNode, 1); 

    cy.$(`#${startNode}`).style('background-color', colors.red); // Đỉnh bắt đầu duyệt mặc định đỏ

    while (queue.length > 0) {
        const node = queue.shift();

        if (graph[node]) {
            for (const neighbor of graph[node]) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);

                    group.set(neighbor, group.get(node) === 1 ? 2 : 1);

                    if (group.get(neighbor) === 1) {
                        cy.$(`#${neighbor}`).style('background-color', colors.red); 
                    } else {
                        cy.$(`#${neighbor}`).style('background-color', colors.blue); 
                    }

                    queue.push(neighbor);
                } else {
                    if (group.get(neighbor) === group.get(node)) {
                        cy.elements().forEach(ele => {
                            ele.style('background-color', colors.gray);
                        });
                        document.getElementById('visitedOrder').innerText += "Đồ thị không phân đôi.";
                        return;
                    }
                }
            }
        }

        // await new Promise(resolve => setTimeout(resolve, delay));
    }

    const isBipartite = Array.from(group.values()).every(g => g === 1 || g === 2);
    if (isBipartite) {
        document.getElementById('visitedOrder').innerText += "Đồ thị phân đôi";
    } else {
        document.getElementById('visitedOrder').innerText += "Đồ thị không phân đôi.";
    }
}




