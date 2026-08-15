function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.response) {
    let data = err.response.data;

    if (Buffer.isBuffer(data)) {
      try {
        data = JSON.parse(data.toString('utf-8'));
      } catch {
        data = undefined;
      }
    }

    return res.status(err.response.status).json({
      error: data?.message || data?.error?.message || 'Erro ao chamar o serviço da Azure',
    });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Erro interno no servidor',
  });
}

module.exports = errorHandler;
