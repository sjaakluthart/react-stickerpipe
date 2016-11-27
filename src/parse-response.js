function parseResponse(response) {
  let text;

  if (response && response.content && (typeof response.content === 'string')) {
    text = response.content;
  }

  if (response && response.text && (typeof response.text === 'string')) {
    text = response.text;
  }

  try {
    const parsedResponse = JSON.parse(text);

    if (
      parsedResponse
      && parsedResponse.data
      && (parsedResponse.data instanceof Object === true)
    ) {
      return parsedResponse.data;
    }
  } catch (err) {
    throw new Error('Error while parsing JSON', err);
  }

  throw new Error('Error while parsing JSON');
}

export default parseResponse;
