export default {
  'file-extension': [
    '.js', '.json', '.md', '.log'
  ],
  'file-name': [ /^[A-Za-z0-9-.]+$/ ],
  'directory-name': [ /^[a-z0-9-]+$/ ],
  'directory-index': {
    ignore: [
      /config$/
    ]
  }
};
