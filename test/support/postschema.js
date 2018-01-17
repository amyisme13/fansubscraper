const postSchema = {
  title: 'post schema',
  type: 'object',
  required: [
    'provider',
    'title',
    'episode',
    'url',
    'thumbnailUrl',
    'series',
    'seriesUrl',
    'releasedAt',
    'downloads',
  ],
  properties: {
    provider: {
      type: 'object',
      required: ['name', 'url'],
      properties: {
        name: {
          type: 'string',
          minLength: 1,
        },
        url: {
          type: 'string',
          minLength: 1,
          format: 'uri',
        },
      },
    },
    postId: {
      type: 'integer',
    },
    title: {
      type: 'string',
      minLength: 1,
    },
    episode: {
      type: 'integer',
    },
    url: {
      type: 'string',
      minLength: 1,
      format: 'uri',
    },
    thumbnailUrl: {
      type: 'string',
      minLength: 1,
      format: 'uri',
    },
    series: {
      type: 'string',
      minLength: 1,
    },
    seriesUrl: {
      type: 'string',
      minLength: 1,
      format: 'uri',
    },
    description: {
      type: 'string',
      minLength: 1,
    },
    releasedAt: {
      type: 'string',
      minLength: 1,
      format: 'date-time',
    },
    downloads: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        required: ['title', 'sources'],
        properties: {
          title: {
            type: 'string',
            minLength: 1,
          },
          sources: {
            type: 'array',
            items: {
              type: 'object',
              required: ['name', 'url'],
              properties: {
                name: {
                  type: 'string',
                  minLength: 1,
                },
                url: {
                  type: 'string',
                  minLength: 1,
                  format: 'uri',
                },
              },
            },
          },
        },
      },
    },
  },
};

module.exports = postSchema;
