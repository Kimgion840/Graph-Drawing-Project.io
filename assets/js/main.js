//Loading animation
window.addEventListener("load", function () {
    let loadingScreen = document.getElementById("loading-screen");

    setTimeout(() => {
        loadingScreen.style.transition = "opacity 0.6s ease";
        loadingScreen.style.opacity = "0";
    }, 200);

    setTimeout(() => {
        loadingScreen.style.display = "none";
    }, 600);
});

//Change Theme
const themeToggle = document.querySelector(".themeInp");

themeToggle.addEventListener('change', () => {
    document.body.classList.toggle('light_theme_var');
})

let cy = null;
let nodeCount = 0;    
let edgeCount = 0;    

function addNode() {
    nodeCount++;

    const newNode = {
        data: {
            id: '' + nodeCount,  
            label: '' + nodeCount
        },
        position: {
            x: Math.random() * 1000,  
            y: Math.random() * 600
        }
    };

    cy.add(newNode);
    document.getElementById('nodeCountInput').value = nodeCount;
    updateGraphInput();
}

function updateGraphInput() {
    const inputText = document.getElementById('graphInput').value.trim();
    const lines = inputText.split('\n');
    let newInputText = lines.join('\n');
    document.getElementById('graphInput').value = newInputText;
}
function updateGraphInfo() {
    const inputText = document.getElementById('graphInput').value.trim();
    const lines = inputText.split('\n');
    let currentMaxNode = 0;
    let edgeCount = lines.length;

    lines.forEach(line => {
        const edgeData = line.split(' ').map(Number);
        if (edgeData.length >= 2) {
            const source = edgeData[0];
            const target = edgeData[1];
            currentMaxNode = Math.max(currentMaxNode, source, target);
        }
        else if (edgeData.length == 1) {
            currentMaxNode = Math.max(currentMaxNode, edgeData);
        }
    });
    nodeCount = currentMaxNode;
    edgeCount = edgeCount;
    document.getElementById('nodeCountInput').value = nodeCount;
    document.getElementById('edgeCountInput').value = edgeCount;
}
function isValidFloat(num) {
    // Kiểm tra xem num có phải là số thực hợp lệ không
    return !isNaN(num) && num.toString().indexOf('.') !== -1;
}

function generateGraph() {
    const inputText = document.getElementById('graphInput').value.trim();
    const lines = inputText.split('\n');
    const graphType = document.querySelector('input[name="graphType"]:checked').value;
    let nodes = [];
    for (let i = 1; i <= nodeCount; i++) {
        nodes.push({
            data: {
                id: '' + i,
                label: '' + i
            }
        });
    }

    let edges = [];
    let edgeOccurrences = {}; 
    let nodePositions = {}; 
    const visitedOrder = document.getElementById("visitedOrder");
    // Nếu không có cung nào được nhập
    if (lines.length === 0 && nodeCount > 0) {
        // Nếu có đỉnh nhưng không có cung, ta tạo đồ thị với chỉ 1 đỉnh.
        lines.push('');  // Chỉ cần tạo 1 cung trống để giữ các đỉnh
    }

    lines.forEach(line => {
        const edgeData = line.split(' ').map(str => parseFloat(str)); 
        if (edgeData.length >= 2) {
            const source = edgeData[0];
            const target = edgeData[1];
            const weight = edgeData[2] || 0; // Trọng số có thể là số âm
            if (source < 0 || target < 0 || isValidFloat(source) || isValidFloat(target)) {
                visitedOrder.innerHTML = "Lỗi! Cung không âm hoặc số thực";
                return NULL;
            }
            const edgeKey = source + '-' + target;
            if (!edgeOccurrences[edgeKey]) {
                edgeOccurrences[edgeKey] = 0;
            }
            edgeOccurrences[edgeKey]++;

            // Tính toán vị trí của các cung để tránh trùng lặp
            let offsetX = 0, offsetY = 0;
            if (edgeOccurrences[edgeKey] > 1) {
                offsetX = (Math.random() - 0.5) * 50; 
                offsetY = (Math.random() - 0.5) * 50;
            }

            const edge = {
                data: {
                    source: '' + source,
                    target: '' + target,
                    weight: weight ? String(weight) : '' // Hiển thị trọng số, có thể là số âm
                },
                style: {
                    'line-color': '#000',
                    'target-arrow-color': '#000',
                    'width': 2,
                    'line-style': 'bezier', 
                    'label': weight ? String(weight) : '',
                    'text-background-color': '#fff',  // Background color for the label to make it stand out
                    'text-background-opacity': 1,
                    'text-border-width': 1,
                    'text-border-color': '#000', // Border color for the label
                    'target-arrow-shape': graphType === 'directed' ? 'triangle' : 'none'
                },
                position: {
                    x: offsetX,
                    y: offsetY
                }
            };
            edges.push(edge);
        }
    });

    // Thiết lập Cytoscape
    cy = cytoscape({
        container: document.getElementById('cy'),
        elements: nodes.concat(edges),
        style: [
            {
                selector: 'node',
                style: {
                    'background-color': '#000',
                    'label': 'data(label)',
                    'color': '#fff',  // Label color
                    'font-size': '15px', 
                    'text-valign': 'center', 
                    'text-halign': 'center' 
                }
            },
            {
                selector: 'edge',
                style: {
                    'width': 2,
                    'line-color': '#000',
                    'target-arrow-color': '#000',
                    'label': 'data(weight)',
                    'target-arrow-shape': 'triangle',
                    'curve-style': 'bezier',
                    'color': '#000', 
                    'text-background-color': '#fff',  
                    'text-background-opacity': 1,
                    'text-border-width': 1,
                    'text-border-color': '#000', // Border color for edge weight
                    'font-size': '14px', 
                    'text-margin-y': -12  
                }
            }
        ],
        layout: {
            name: 'grid',
            rows: 3
        },
        ready: function () {
            console.log('Graph is ready!');
        }
    });
}

document.getElementById("graphInput").addEventListener("input", function (event) {
    let input = event.target.value;

    // Chỉ cho phép số nguyên, dấu cách, xuống dòng, và dấu "-" cho số âm
    let cleanedInput = input.replace(/[^0-9\s\n\.\-]/g, '');

    cleanedInput = cleanedInput.split('\n').map(line => {
        let parts = line.split(/\s+/).filter(part => part !== ''); // Loại bỏ khoảng trắng thừa

        // Nếu dòng trống hoặc chỉ có Space, giữ nguyên (cho phép nhập tiếp)
        if (line.trim() === "") {
            return line;
        }

        // Nếu đang nhập dở (1 hoặc 2 số và có dấu cách phía sau), giữ nguyên
        if (parts.length === 1 || parts.length === 2) {
            return parts.join(' ') + (line.endsWith(" ") ? " " : ""); // Giữ dấu cách để nhập tiếp
        }

        // Nếu dòng có đúng 2 hoặc 3 số hợp lệ, chuẩn hóa lại
        if (parts.length === 2 || parts.length === 3) {
            return parts.join(' ');
        }
        // Nếu nhập quá 3 số, cảnh báo và chỉ giữ 3 số đầu
        if (parts.length > 3) {
            // visitedOrder.innerHTML = "Mỗi dòng chỉ được nhập tối đa 3 số nguyên!";
            return parts.slice(0, 3).join(' '); // Chỉ lấy 3 số đầu tiên
        }

        return "";
    }).join('\n');

    // Cập nhật lại giá trị vào ô nhập liệu (chỉ khi có sự thay đổi thực sự)
    if (event.target.value !== cleanedInput) {
        event.target.value = cleanedInput;
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const selectElement = document.getElementById("traversalType");
    const pseudoCodeContainer = document.querySelector(".fakeLang p");

    const pseudoCodeMap = {
        bfs: `Đưa 1 đỉnh bất kỳ vào Hàng đợi<br>
while Hàng đợi chưa rỗng {<br>
&nbsp;&nbsp;&nbsp;&nbsp;u = lấy đỉnh ở đầu hàng đợi ra<br>
&nbsp;&nbsp;&nbsp;&nbsp;if (u đã duyệt) continue;<br>
&nbsp;&nbsp;&nbsp;&nbsp;Duyệt u<br>
&nbsp;&nbsp;&nbsp;&nbsp;Đánh dấu u đã được duyệt<br>
&nbsp;&nbsp;&nbsp;&nbsp;for các đỉnh kề v của u {<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;if v chưa được duyệt<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Đưa v vào hàng đợi<br>
&nbsp;&nbsp;&nbsp;&nbsp;}<br>
}`,
        "bfs-fullGraph": `Đưa các đỉnh chưa duyệt vào hàng đợi, lặp lại BFS cho từng thành phần liên thông.`,
        dfs: `Đưa 1 đỉnh bất kỳ vào Ngăn xếp<br>
while Ngăn xếp chưa rỗng {<br>
&nbsp;&nbsp;&nbsp;&nbsp;u = lấy đỉnh ở đỉnh ngăn xếp ra<br>
&nbsp;&nbsp;&nbsp;&nbsp;if (u đã duyệt) continue;<br>
&nbsp;&nbsp;&nbsp;&nbsp;Duyệt u<br>
&nbsp;&nbsp;&nbsp;&nbsp;Đánh dấu u đã được duyệt<br>
&nbsp;&nbsp;&nbsp;&nbsp;for các đỉnh kề v của u (duyệt ngược) {<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;if v chưa được duyệt<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Đưa v vào ngăn xếp<br>
&nbsp;&nbsp;&nbsp;&nbsp;}<br>
}`,
        "dfs-fullGraph": `Lặp lại DFS cho từng thành phần liên thông, dùng ngăn xếp.`,
        "dfs-recursion": `Hàm DFS(u):<br>
&nbsp;&nbsp;&nbsp;&nbsp;if (u đã được duyệt) return;<br>
&nbsp;&nbsp;&nbsp;&nbsp;Duyệt u;<br>
&nbsp;&nbsp;&nbsp;&nbsp;Đánh dấu u đã được duyệt;<br>
&nbsp;&nbsp;&nbsp;&nbsp;for các đỉnh kề v của u {<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;DFS(v);<br>
&nbsp;&nbsp;&nbsp;&nbsp;}<br><br>
Gọi DFS(startNode);`,
        "dfs-recursion-fullGraph": `Lặp lại DFS cho từng thành phần liên thông, dùng đệ quy.`,
        "mooreDijkstra": `**Khởi tạo:<br>
&nbsp;&nbsp;&nbsp;&nbsp;Tất cả các đỉnh đều chưa đánh dấu<br>
&nbsp;&nbsp;&nbsp;&nbsp;Với mọi u ≠ s, 𝜋[u] = ∞, 𝜋[s] = 0<br>
**Lặp i từ 1 đến n - 1:<br>
&nbsp;&nbsp;&nbsp;&nbsp;Tìm u chưa đánh dấu có 𝜋[u] nhỏ nhất<br>
&nbsp;&nbsp;&nbsp;&nbsp;Đánh dấu u<br>
&nbsp;&nbsp;&nbsp;&nbsp;for các đỉnh kề v của u:<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;if v chưa đánh dấu và (𝜋[u] + trọng số (u,v) < 𝜋[v]) then<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;𝜋[v] = 𝜋[u] + trọng số (u, v)<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;p[v] = u<br>`,
"bipartite": `Khởi tạo mảng màu -1<br>
Duyệt i: nếu chưa tô && !bfs(i) → FALSE<br>
Trả về TRUE;<br>
Đưa u vào Hàng đợi, tô Xanh (0)<br>
while (!Hàng đợi rỗng) {<br>
&nbsp;&nbsp;&nbsp;&nbsp;Lấy u, duyệt kề v:<br>
&nbsp;&nbsp;&nbsp;&nbsp;if (v chưa tô) tô đối lập, đẩy vào Hàng đợi;<br>
&nbsp;&nbsp;&nbsp;&nbsp;if (color[v] == color[u]) → FALSE;<br>
}<br>
Trả về TRUE;`,
"Tarjan": `Khởi tạo num, low = -1, stack rỗng  <br>
Duyệt i: nếu chưa thăm → Tarjan(i)  <br>
Tarjan(u):  <br>
&nbsp;&nbsp;&nbsp;&nbsp;Gán num[u] = low[u] = ++index, đẩy vào stack   <br>
&nbsp;&nbsp;&nbsp;&nbsp;Duyệt kề v:  <br>
&nbsp;&nbsp;&nbsp;&nbsp;if (v chưa thăm) Tarjan(v), cập nhật low[u]  <br>
&nbsp;&nbsp;&nbsp;&nbsp;if (v trong stack) cập nhật low[u]  <br>
&nbsp;&nbsp;&nbsp;&nbsp;if (num[u] == low[u]) → pop stack tạo SCC  <br>
`,
"Circled":
`**Khởi tạo:**<br>
&nbsp;&nbsp;&nbsp;&nbsp;Đánh dấu tất cả đỉnh là chưa thăm (visited[u] = false)<br>
&nbsp;&nbsp;&nbsp;&nbsp;Tạo recStack để theo dõi đỉnh trong ngăn xếp đệ quy<br>

**Kiểm tra chu trình:**<br>
&nbsp;&nbsp;&nbsp;&nbsp;for mỗi đỉnh u chưa thăm:<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;if DFS(u) trả về true then<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Kết luận: "Có chu trình"<br>

**Hàm DFS(u):**<br>
&nbsp;&nbsp;&nbsp;&nbsp;Đánh dấu visited[u] = true, recStack[u] = true<br>
&nbsp;&nbsp;&nbsp;&nbsp;for mỗi đỉnh kề v của u:<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;if v chưa thăm và DFS(v) == true then return true<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;if recStack[v] == true then return true<br>
&nbsp;&nbsp;&nbsp;&nbsp;Đánh dấu recStack[u] = false<br>
&nbsp;&nbsp;&nbsp;&nbsp;return false<br>

**Kết luận:**<br>
&nbsp;&nbsp;&nbsp;&nbsp;Nếu không có chu trình, trả về "Không chứa chu trình"<br>

`,
"topoSort":
`Khởi tạo adjList, inDegree<br>
for mỗi đỉnh u trong nodes:<br>
&nbsp;&nbsp;&nbsp;&nbsp;adjList[u] = [], inDegree[u] = 0<br>

for mỗi cạnh (u → v) trong edges:<br>
&nbsp;&nbsp;&nbsp;&nbsp;Thêm v vào adjList[u]<br>
&nbsp;&nbsp;&nbsp;&nbsp;Tăng inDegree[v]<br>

Khởi tạo queue = []<br>
for mỗi u trong nodes:<br>
&nbsp;&nbsp;&nbsp;&nbsp;if inDegree[u] == 0 then queue.push(u)<br>

Khởi tạo result = []<br>
while queue không rỗng:<br>
&nbsp;&nbsp;Lấy node = queue.shift()<br>
&nbsp;&nbsp;Thêm node vào result<br>

&nbsp;&nbsp;for mỗi neighbor của node:<br>
&nbsp;&nbsp;&nbsp;&nbsp;Giảm inDegree[neighbor]<br>
&nbsp;&nbsp;&nbsp;&nbsp;if inDegree[neighbor] == 0 then queue.push(neighbor)<br>

if result.length != nodes.length:<br>
&nbsp;&nbsp;return "Có chu trình trong đồ thị!"<br>
else:<br>
&nbsp;&nbsp;return result<br>`,

"bellmanFord":
`Khởi tạo khoảng cách dist với tất cả các đỉnh:<br>
&nbsp;&nbsp;&nbsp; i từ 0 đến V-1: dist[i] = Infinity<br>
Đặt dist[src] = 0<br>
for i từ 1 đến V-1:<br>
&nbsp;&nbsp;&nbsp; mỗi cạnh (u, v, w) trong graph:<br>
&nbsp;&nbsp;&nbsp;&nbsp;if dist[u] + w < dist[v]:<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;dist[v] = dist[u] + w<br>

for mỗi cạnh (u, v, w) trong graph:<br>
&nbsp;&nbsp;&nbsp;&nbsp;if dist[u] + w < dist[v]:<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;return "Đồ thị chứa chu trình âm"<br>

Kết luận:<br>
Nếu không có chu trình âm, trả về dist (mảng khoảng cách ngắn nhất).<br>`,

    };

    selectElement.addEventListener("change", function () {
        const selectedAlgorithm = this.value;
        pseudoCodeContainer.innerHTML = pseudoCodeMap[selectedAlgorithm] || "Mã giả tại đây";
    });

    selectElement.dispatchEvent(new Event("change"));
});

//an endNodeInput
document.addEventListener("DOMContentLoaded", function () {
    const traversalSelect = document.getElementById("traversalType");
    const endNodeInputGroup = document.querySelector(".pointEnd");

    // Mặc định ẩn endNodeInput
    endNodeInputGroup.style.display = "none";

    traversalSelect.addEventListener("change", function () {
        if (this.value === "mooreDijkstra" || this.value === "bellmanFord") {
            endNodeInputGroup.style.display = "flex";
        } else {
            endNodeInputGroup.style.display = "none";
        }
    });
});

document.getElementById("traversalType").addEventListener("change", function () {
    const graphTypeRadios = document.getElementsByName("graphType");
    const directedRadio = graphTypeRadios[0]; 
    const undirectedRadio = graphTypeRadios[1]; 
    const selectedAlgorithm = this.value;
    const createGraphButton = document.getElementById("creatGraph");
    const startNodes = document.getElementById("startNodeInput");
    if (selectedAlgorithm === "bipartite") {
        directedRadio.disabled = true;
        directedRadio.parentElement.style.opacity = "0.75";
        undirectedRadio.checked = true;
        
        updateGraphToUndirected();
        createGraphButton.click(); 
    } else {
        directedRadio.disabled = false;
        directedRadio.parentElement.style.opacity = "1"; 
    }
    if (selectedAlgorithm === "topoSort") {
        undirectedRadio.disabled = true;
        undirectedRadio.parentElement.style.opacity = "0.75";
        directedRadio.checked = true;
        startNodes.disabled = true;
        createGraphButton.click(); 
    } else {
        undirectedRadio.disabled = false;
        startNodes.disabled = false;
        undirectedRadio.parentElement.style.opacity = "1"; 
    }

});

function updateGraphToUndirected() {
    console.log("Đã đổi đồ thị thành vô hướng.");
}

// document.getElementById("convertToImageButton").addEventListener("click", function() {
//     const pngData = cy.png({
//         bg: 'white'
//     });
//     const link = document.createElement('a');
//     link.href = pngData;
//     link.download = 'graph.png';
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
// });