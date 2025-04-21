import { mergeAttributes, Node } from '@tiptap/core'

export interface TableHeaderOptions {
  /**
   * The HTML attributes for a table header node.
   * @default {}
   * @example { class: 'foo' }
   */
  HTMLAttributes: Record<string, any>,
}

/**
 * This extension allows you to create table headers.
 * @see https://www.tiptap.dev/api/nodes/table-header
 */
export const TableHeader = Node.create<TableHeaderOptions>({
  name: 'tableHeader',
  group: 'block',
  content: 'inline*',

  draggable: false,

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },


  addAttributes() {
    return {
      colspan: {
        default: 1,
      },
      rowspan: {
        default: 1,
      },
      colwidth: {
        default: null,
        parseHTML: element => {
          const colwidth = element.getAttribute('colwidth')
          const value = colwidth
            ? colwidth.split(',').map(width => parseInt(width, 10))
            : null

          return value
        },
      },

      backgroundColor: {
        parseHTML: (element) => element.style.backgroundColor || null,
        renderHTML: (attributes) => {
            if (!attributes.backgroundColor) {
                return {};
            }
            return {
                style: `background-color: ${attributes.backgroundColor}`,
            };
        },
    },
    }
  },

  tableRole: 'header_cell',

  isolating: true,

  parseHTML() {
    return [
      {
        tag: 'td[data-type="custom-column"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['td', { ...HTMLAttributes, 'data-type': 'custom-column' }, 0];

  },
})