import {BinTreeNode} from './bin-tree-node';

export class BinaryTreeParser {
  static arrayToBinaryTree = (array: any[]): BinTreeNode => {
    const binTreeNode: BinTreeNode = { id: undefined, left: undefined, right: undefined };

    binTreeNode.id = array[0];
    binTreeNode.left = array [1] ? BinaryTreeParser.arrayToBinaryTree(array[1]) : null;
    binTreeNode.right = array[2] ? BinaryTreeParser.arrayToBinaryTree(array[2]) : null;

    return binTreeNode;
  }
}
