import * as lineIntersect from 'line-intersect';

export type IPoint = [number, number];

class Node {
    val: string;
    priority: number;
    constructor(val: string, priority: number) {
        this.val = val;
        this.priority = priority;
    }
}

class PriorityQueue {
    values: Node[];
    constructor() {
        this.values = [];
    }

    enqueue(val: string, priority: number) {
        let newNode = new Node(val, priority);
        this.values.push(newNode);
        this.bubbleUp();
    }

    bubbleUp() {
        let idx = this.values.length - 1;
        const element = this.values[idx];
        while (idx > 0) {
            let parentIdx = Math.floor((idx - 1) / 2);
            let parent = this.values[parentIdx];
            if (element.priority >= parent.priority) break;
            this.values[parentIdx] = element;
            this.values[idx] = parent;
            idx = parentIdx;
        }
    }

    dequeue() {
        const min = this.values[0];
        const end = this.values.pop();
        if (this.values.length > 0) {
            this.values[0] = <Node>end;
            this.sinkDown();
        }
        return min;
    }

    sinkDown() {
        let idx = 0;
        const length = this.values.length;
        const element = this.values[0];
        while (true) {
            let leftChildIdx = 2 * idx + 1;
            let rightChildIdx = 2 * idx + 2;
            let leftChild, rightChild;
            let swap = null;

            if (leftChildIdx < length) {
                leftChild = this.values[leftChildIdx];
                if (leftChild.priority < element.priority) {
                    swap = leftChildIdx;
                }
            }
            if (rightChildIdx < length) {
                rightChild = this.values[rightChildIdx];
                if (
                    (swap === null && rightChild.priority < element.priority) ||
                    (swap !== null && rightChild.priority < (leftChild as Node).priority)
                ) {
                    swap = rightChildIdx;
                }
            }
            if (swap === null) break;
            this.values[idx] = this.values[swap];
            this.values[swap] = element;
            idx = swap;
        }
    }
}

//Dijkstra's algorithm only works on a weighted graph.

class WeightedGraph {
    adjacencyList: { [key: string]: { node: string; weight: number }[] };
    vertex!: IPoint | string;
    constructor() {
        this.adjacencyList = {};
    }

    addVertex(vertex: IPoint | string) {
        vertex = JSON.stringify(vertex);
        if (!this.adjacencyList[vertex]) this.adjacencyList[vertex] = [];
    }

    addEdge(vertex1: IPoint | string, vertex2: IPoint | string, weight: number) {
        const v1 = JSON.stringify(vertex1);
        const v2 = JSON.stringify(vertex2);
        if (!this.adjacencyList[v1].filter(edge => edge.node === v2).length) {
            this.adjacencyList[v1].push({ node: v2, weight });
        }
        if (!this.adjacencyList[v2].filter(edge => edge.node === v1).length) {
            this.adjacencyList[v2].push({ node: v1, weight });
        }
    }

    size() {
        return Object.keys(this.adjacencyList).length;
    }

    print() {
        console.log(this.adjacencyList);
    }

    getAllEdges() {
        let edges: [IPoint, IPoint][] | any = [];
        for (let vertex in this.adjacencyList) {
            for (let edge of this.adjacencyList[vertex]) {
                const edgeObj = [vertex, edge.node]
                if (edges.includes(JSON.stringify([edge.node, vertex]))) {
                    continue;
                }
                edges.push(JSON.stringify(edgeObj));
            }
        }
        return edges.map((edge: string) => JSON.parse(edge).map((vertex: string) => JSON.parse(vertex)));
    }

    Dijkstra(start: string, finish: string) {
        const nodes = new PriorityQueue();
        const distances: Record<string, any> = {};
        const previous: Record<string, any> = {};
        let path: string[] = []; //to return at end
        let smallest;
        //build up initial state
        for (let vertex in this.adjacencyList) {
            if (vertex === start) {
                distances[vertex] = 0;
                nodes.enqueue(vertex, 0);
            } else {
                distances[vertex] = Infinity;
                nodes.enqueue(vertex, Infinity);
            }
            previous[vertex] = null;
        }

        // as long as there is something to visit
        while (nodes.values.length) {
            smallest = nodes.dequeue().val;
            if (smallest === finish) {
                //WE ARE DONE
                //BUILD UP PATH TO RETURN AT END
                while (previous[smallest]) {
                    path.push(smallest);
                    smallest = previous[smallest];
                }
                break;
            }
            if (smallest || distances[smallest] !== Infinity) {
                for (let neighbor in this.adjacencyList[smallest]) {
                    //find neighboring node
                    let nextNode = this.adjacencyList[smallest][neighbor];
                    //calculate new distance to neighboring node
                    let candidate = distances[smallest] + nextNode.weight;
                    let nextNeighbor = nextNode.node;
                    if (candidate < distances[nextNeighbor]) {
                        //updating new smallest distance to neighbor
                        distances[nextNeighbor] = candidate;
                        //updating previous - How we got to neighbor
                        previous[nextNeighbor] = smallest;
                        //enqueue in priority queue with new priority
                        nodes.enqueue(nextNeighbor, candidate);
                    }
                }
            }
        }
        return path.concat(smallest).reverse();
    }
}

export function findShortestPath(startPoint: IPoint, endPoint: IPoint, path: IPoint[], obstacles: IPoint[][]): IPoint[] {
    const obstacleGraphs = [];
    for (const obstacle of obstacles) {
        obstacleGraphs.push(createGraphFromObstacle(obstacle));
    }

    let pathGraph = createGraphFromPath(path, obstacleGraphs);

    const pathEdges = pathGraph.getAllEdges();

    const intersectPoints = [];
    const nearestIntersectPoints = [];

    if (isPointNotOnAnyEdgesOfPath(startPoint, path)) {
        for (const edge of pathEdges) {
            const intersectPoint = findTheIntersectPointWithEdgeOfPath(startPoint, edge);

            if (!intersectPoint || obstacleGraphs.some(obstacle => isEdgeIntersectWithObstacles([startPoint, intersectPoint], obstacle.getAllEdges()))) {
                continue;
            }

            intersectPoints.push(intersectPoint);
        }
        if (intersectPoints.length) {
            const nearestIntersectPoint = findNearestIntersectPoint(intersectPoints, startPoint);
            nearestIntersectPoints.push(nearestIntersectPoint);
        }
        nearestIntersectPoints.push(startPoint);
    } else {
        nearestIntersectPoints.push(startPoint);
    }

    if (isPointNotOnAnyEdgesOfPath(endPoint, path)) {
        for (const edge of pathEdges) {
            const intersectPoint = findTheIntersectPointWithEdgeOfPath(endPoint, edge);

            if (!intersectPoint || obstacleGraphs.some(obstacle => isEdgeIntersectWithObstacles([endPoint, intersectPoint], obstacle.getAllEdges()))) {
                continue;
            }

            intersectPoints.push(intersectPoint);
        }
        if (intersectPoints.length) {
            const nearestIntersectPoint = findNearestIntersectPoint(intersectPoints, endPoint);
            nearestIntersectPoints.push(nearestIntersectPoint);
        }
        nearestIntersectPoints.push(endPoint);
    } else {
        nearestIntersectPoints.push(endPoint);
    }

    const uniqueIntersectPoints: IPoint[] = Array.from(new Set(nearestIntersectPoints.map(JSON.stringify as any))).map(JSON.parse as any);

    if (intersectPoints.length) {
        path.push(...uniqueIntersectPoints);
        pathGraph = createGraphFromPath(path, obstacleGraphs);
    }

    return pathGraph
        .Dijkstra(JSON.stringify(startPoint), JSON.stringify(endPoint)).map((point) => JSON.parse(point));
}

function findNearestIntersectPoint(intersectPoints: IPoint[], startPoint: IPoint) {
    let nearestIntersectPoint = intersectPoints[0];
    let nearestDistance = getDistanceBetweenPoints(startPoint, nearestIntersectPoint);

    for (const intersectPoint of intersectPoints) {
        const distance = getDistanceBetweenPoints(startPoint, intersectPoint);
        if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestIntersectPoint = intersectPoint;
        }
    }

    return nearestIntersectPoint;
}

function getDistanceBetweenPoints(point_1: IPoint, point_2: IPoint) {
    return Math.sqrt(Math.pow(point_1[0] - point_2[0], 2) + Math.pow(point_1[1] - point_2[1], 2));
}


function createGraphFromPath(path: IPoint[], obstacleGraphs: WeightedGraph[]) {
    const graph = new WeightedGraph();
    for (let i = 0; i < path.length; i++) {
        graph.addVertex(path[i]);
        const [x, y] = path[i];
        const adjacentPoints: IPoint[] = getAdjacentPoint(x, y, path.slice(i + 1));

        for (let j = 0; j < adjacentPoints.length; j++) {
            graph.addVertex(adjacentPoints[j]);
            if (!obstacleGraphs.some(obstacle => isEdgeIntersectWithObstacles([path[i], adjacentPoints[j]], obstacle.getAllEdges()))) {
                graph.addEdge(path[i], adjacentPoints[j], calculateLengthOfEdge(path[i], adjacentPoints[j]));
            }
        }
    }
    return graph;
}

function createGraphFromObstacle(obstacle: any) {
    const graph = new WeightedGraph();
    for (let i = 0; i < obstacle.length; i++) {
        graph.addVertex(obstacle[i]);
        const [x, y] = obstacle[i];
        const adjacentPoints = getAdjacentPoint(x, y, obstacle.slice(i + 1));
        for (let j = 0; j < adjacentPoints.length; j++) {
            graph.addVertex(adjacentPoints[j]);
            graph.addEdge(obstacle[i], adjacentPoints[j], calculateLengthOfEdge(obstacle[i], adjacentPoints[j]));
        }
    }
    return graph;
}

function findTheIntersectPointWithEdgeOfPath(point: IPoint, edge: [IPoint, IPoint]): IPoint | null {
    const INFINITY = 10000000;
    const [x1, y1] = point;
    const [[x2, y2], [x3, y3]] = edge;
    // intersect with y axis
    let result = lineIntersect.checkIntersection(x1, y1, x1, y1 + INFINITY, x2, y2, x3, y3);

    if (result.type === "intersecting") {
        return [result.point.x, result.point.y];
    }

    // intersect with reverse y axis
    result = lineIntersect.checkIntersection(x1, y1, x1, y1 - INFINITY, x2, y2, x3, y3);

    if (result.type === "intersecting") {
        return [result.point.x, result.point.y];
    }
    // intersect with x axis
    result = lineIntersect.checkIntersection(x1, y1, x1 + INFINITY, y1, x2, y2, x3, y3);

    if (result.type === "intersecting") {
        return [result.point.x, result.point.y];
    }

    // intersect with reverse x xis
    result = lineIntersect.checkIntersection(x1, y1, x1 - INFINITY, y1, x2, y2, x3, y3);

    if (result.type === "intersecting") {
        return [result.point.x, result.point.y];
    }

    return null;
}

function isEdgeIntersectWithObstacles(edge: [IPoint, IPoint], obstacles: any) {
    const [[x1, y1], [x2, y2]] = edge;
    for (const obstacle of obstacles) {
        const [[x3, y3], [x4, y4]] = obstacle;
        const result = lineIntersect.checkIntersection(x1, y1, x2, y2, x3, y3, x4, y4);
        if (result.type === 'intersecting') {
            return true;
        }
    }
    return false;
}


function isPointNotOnAnyEdgesOfPath(point: IPoint, path: IPoint[]) {
    const [x, y] = point;
    const adjacentPoints = getAdjacentPoint(x, y, path);
    return adjacentPoints.length === 0;
}


function getAdjacentPoint(x: number, y: number, path: IPoint[]) {
    const adjacentPoints: IPoint[] = [];
    for (let i = 0; i < path.length; i++) {
        const [x1, y1] = path[i];
        if (x === x1 && (y > y1 || y < y1)) {
            adjacentPoints.push([x1, y1]);
        }
        if (y === y1 && (x > x1 || x < x1)) {
            adjacentPoints.push([x1, y1]);
        }
    }
    return adjacentPoints;
}


function isEdgeX(startPoint: IPoint, endPoint: IPoint) {
    return startPoint[0] === endPoint[0];
}

function isEdgeY(startPoint: IPoint, endPoint: IPoint) {
    return startPoint[1] === endPoint[1];
}

function calculateLengthOfEdge(startPoint: IPoint, endPoint: IPoint) {
    if (isEdgeX(startPoint, endPoint)) {
        return Math.abs(startPoint[1] - endPoint[1]);
    }

    if (isEdgeY(startPoint, endPoint)) {
        return Math.abs(startPoint[0] - endPoint[0]);
    }
    return 0;
}

export const startPoint: IPoint = [863, 655];
export const endPoint: IPoint = [280, 392];
export const path: IPoint[] = [
    [42, 302],
    [42, 210],
    [345, 210],
    [948, 210],
    [1240, 210],
    [1240, 290],
    [345, 510],
    [655, 510],
    [345, 830],
    [38, 830],
    [715, 830],
    [715, 728],
    [948, 830],
    [1240, 830],
    [1240, 728],
]

export const obstaclesB4: IPoint[][] = [
    [
        [423, 255],
        [852, 255],
        [423, 348],
        [852, 348]
    ],
    [
        [423, 358],
        [658, 355],
        [423, 445],
        [658, 445]
    ],
    [
        [423, 570],
        [658, 570],
        [423, 760],
        [658, 760]
    ],
    [
        [772, 375],
        [865, 375],
        [772, 592],
        [865, 592]
    ],
    [
        [772, 610],
        [856, 610],
        [772, 722],
        [856, 722]
    ],
    [
        [772, 737],
        [864, 737],
        [772, 772],
        [864, 772]
    ],
    [
        [1043, 262],
        [1165, 262],
        [1043, 348],
        [1165, 348],
    ],
    [
        [1023, 387],
        [1114, 387],
        [1023, 646],
        [1114, 646]
    ],
    [
        [2, 675],
        [233, 675],
        [2, 762],
        [233, 762]
    ],
    [
        [1204, 292],
        [1270, 292],
        [1204, 719],
        [1270, 719]
    ],
    [
        [1050, 668],
        [1130, 668],
        [1050, 760],
        [1130, 760]
    ]
]

const shortestPath = findShortestPath(startPoint, endPoint, path, obstaclesB4)

console.log(shortestPath)
