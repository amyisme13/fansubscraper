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
        },
        url: {
          type: 'string',
          format: 'uri',
        },
      },
    },
    postId: {
      type: 'integer',
    },
    title: {
      type: 'string',
    },
    episode: {
      type: 'integer',
    },
    url: {
      type: 'string',
      format: 'uri',
    },
    thumbnailUrl: {
      type: 'string',
      format: 'uri',
    },
    series: {
      type: 'string',
    },
    seriesUrl: {
      type: 'string',
      format: 'uri',
    },
    description: {
      type: 'string',
    },
    releasedAt: {
      type: 'string',
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
          },
          sources: {
            type: 'array',
            items: {
              type: 'object',
              required: ['name', 'url'],
              properties: {
                name: {
                  type: 'string',
                },
                url: {
                  type: 'string',
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
