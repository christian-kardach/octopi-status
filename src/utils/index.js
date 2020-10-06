function Queue() {
    this.elements = [];
}
Queue.prototype.enqueue = function (e) {
    this.elements.push(e);
};
Queue.prototype.dequeue = function () {
    return this.elements.shift();
};
Queue.prototype.isEmpty = function () {
    return this.elements.length == 0;
};

function between(x, min, max) {
    return x >= min && x <= max;
}

module.exports = {
    Queue,
    between
}