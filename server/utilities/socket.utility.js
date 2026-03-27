let ioInstance = null;

function setSocketIo(io) {
  ioInstance = io;
}

function getSocketIo() {
  return ioInstance;
}

module.exports = {
  setSocketIo,
  getSocketIo,
};