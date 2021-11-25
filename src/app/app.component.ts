import {Component, DoCheck, ElementRef, OnInit, ViewChild} from '@angular/core';
import { BinTreeNode } from './bin-tree-node';
import {Alert} from './alert/alert.enum';
import { FileSystemFileEntry, NgxFileDropEntry} from 'ngx-file-drop';
import {BinaryTreeParser} from './binary-tree-parser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, DoCheck {
  title = 'binary-tree';
  file: NgxFileDropEntry;

  editorOptions = { theme: 'vs-dark', language: 'json'};
  code = '';
  lastCode = '';

  error: {
    syntaxError: boolean,
    entryTypeError: boolean,
    fileType: boolean
  };

  lastFiles = [];
  reader = new FileReader();
  allowedFileExtensions = ['json', 'text'];

  @ViewChild('svgContainer')
  svgContainer: ElementRef<SVGAElement>;

  smallestSubTree: BinTreeNode;
  binTreeHeight: number;

  ngOnInit() {
    this.error = {
      syntaxError: false,
      entryTypeError: false,
      fileType: false
    };
    const lastFiles = JSON.parse(localStorage.getItem('lastFiles'));
    this.lastFiles = lastFiles ? lastFiles : [];
    this.reader.addEventListener('load', (event: ProgressEvent) => {
      const binTreeArrayAsText = event.target['result'];
      if (!this.lastFiles.some(lF => lF.text === binTreeArrayAsText)) {
        this.lastFiles.push({ fileName: this.reader['lastFileName'], text: binTreeArrayAsText });
        localStorage.setItem('lastFiles', JSON.stringify(this.lastFiles));
      }
      this.showBinTreeInCode(binTreeArrayAsText);
    });


  }

  showBinTreeInCode(binTreeArrayAsText: string) {
    this.lastCode = this.code;
    this.code = JSON.stringify(BinaryTreeParser.arrayToBinaryTree(JSON.parse(binTreeArrayAsText)), null, '\t');
    console.log('m');
  }

  ngDoCheck() {
    try {
      if (this.code !== this.lastCode) {
        this.lastCode = this.code;
        const bin: BinTreeNode = JSON.parse(this.code) as BinTreeNode;
        this.error.syntaxError = false;
        this.error.entryTypeError = !this.isBinTree(bin);

        if (this.isThereError()) {
          return;
        }
        console.log(this.findSmallestSubtree(bin));
        this.binTreeHeight = this.findNodeHeight(bin);
        console.log(this.binTreeHeight);
        console.log('width', this.binTreeHeight * 150);
        console.log('height', this.binTreeHeight * 200);

        this.removeSvgChildrenNodes();
        this.svgContainer.nativeElement.setAttributeNS(null, 'width', `${this.binTreeHeight * 150}`);
        this.svgContainer.nativeElement.setAttributeNS(null, 'height', `${this.binTreeHeight * 200}`);
        this.svgContainer.nativeElement.appendChild(this.goThroughBinTree(bin, this.binTreeHeight * 150, this.binTreeHeight * 200, 0, 0));

      }
    } catch (e) {
      if (e instanceof SyntaxError) {
        this.error.syntaxError = !!this.code;
        this.error.entryTypeError = false;
      } else {
        console.log(e.message);
      }
    }
  }

  isThereError() {
    return Object.values(this.error).some(value => value === true);
  }

  removeSvgChildrenNodes() {
    this.svgContainer.nativeElement.childNodes.forEach(childNode => {
      this.svgContainer.nativeElement.removeChild(childNode);
    });
  }

  isBinTreeNode(object: any): object is BinTreeNode {
    return object && object.id && ['number', 'string'].includes(typeof object.id)
      && (object.left === undefined || typeof object.left === 'object') && (object.right === undefined || typeof object.right === 'object');
  }

  isBinTree(object) {
    const isParentNodeBinTreeNode = this.isBinTreeNode(object);
    let isLeftNodeBinTreeNode = true;
    let isRightNodeBinTreeNode = true;
    if (object.left) {
      isLeftNodeBinTreeNode = this.isBinTree(object.left);
    }
    if (object.right) {
      isRightNodeBinTreeNode = this.isBinTree(object.right);
    }
    return isParentNodeBinTreeNode && isLeftNodeBinTreeNode && isRightNodeBinTreeNode;
  }

  goThroughBinTree(binTree: BinTreeNode, width, height, x, y): SVGAElement {
    const g = this.getNode('g', { });
    const svgProperties = { id: binTree.id, width, height, x, y };
    const svg = this.getNode('svg', svgProperties);

    svg.appendChild(this.getRect(binTree, svgProperties));
    g.appendChild(svg);

    if (binTree.left) {
      g.appendChild(this.goThroughBinTree(binTree.left, (width / 2) - 10, height / 1.5, x + 10, y + 25));
    }
    if (binTree.right) {
      g.appendChild(this.goThroughBinTree(binTree.right, (width / 2) - 10, height / 1.5, x + width / 2 + 2, y + 25));
    }

    return g;
  }

  getRect(binTree: BinTreeNode, parentProperties: { width, height }) {
    const g = this.getNode('g', {});
    const text = this.getNode('text', { x: `${parentProperties.width / 2}`, y: `${30}`, 'font-family': 'Verdana', 'font-size': 16, fill: 'black', 'dominant-baseline': 'middle', 'text-anchor': 'middle' });
    text.textContent = binTree.id;
    const rectBorderColor = this.smallestSubTree !== binTree ? 'purple' : 'green';

    if (binTree.right || binTree.left) {
      const bigRect = this.getNode('rect', { x: 5, y: 40, width: parentProperties.width - 10, height: parentProperties.height - 55, fill: '#fff', 'stroke-width': 2, stroke: 'rgb(183,153,52)' });
      console.log('smallest', this.smallestSubTree);
      console.log('current', binTree);
      const rect = this.getNode('rect', { x: 0, y: 20, width: parentProperties.width, height: parentProperties.height - 30, fill: '#fff', 'stroke-width': 2, stroke: rectBorderColor });
      g.appendChild(rect);
      g.appendChild(bigRect);
    } else {
      const rect = this.getNode('rect', { x: 0, y: 20, width: parentProperties.width, height: 40, fill: '#fff', 'stroke-width': 2, stroke: rectBorderColor });
      g.appendChild(rect);

    }
    g.appendChild(text);
    return g;
  }

  findNodeHeight(binTree: BinTreeNode) {
    if (!binTree.left && !binTree.right) {
      return 1;
    }

    const leftHeight = binTree.left ? this.findNodeHeight(binTree.left) : 0;
    const rightHeight = binTree.right ? this.findNodeHeight(binTree.right) : 0;

    if (leftHeight === rightHeight) {
      this.smallestSubTree = binTree;
    }

    return Math.max(leftHeight, rightHeight) + 1;
  }

  public get alert(): typeof Alert {
    return Alert;
  }

  findSmallestSubtree(binTree: BinTreeNode) {
    const leftHeight = binTree.left ? this.findNodeHeight(binTree.left) : 0;
    const rightHeight = binTree.right ? this.findNodeHeight(binTree.right) : 0;

    if (leftHeight > rightHeight) {
      return this.findSmallestSubtree(binTree.left);
    } else if (rightHeight > leftHeight) {
      return this.findSmallestSubtree(binTree.right);
    } else {
      this.smallestSubTree = binTree;
      return;
    }
  }

  public fileDropped(file: NgxFileDropEntry) {
    this.error.fileType = false;
    this.file = file;
    if (this.file.fileEntry.isFile) {
      if (!this.isAllowedFileExtension(this.file)) {
        this.error.fileType = true;
        return;
      }
      const fileEntry = this.file.fileEntry as FileSystemFileEntry;
      fileEntry.file((f: File) => {
        this.reader['lastFileName'] = this.file.fileEntry.name;
        this.reader.readAsText(f);
      });
    }
  }

  getFileExtension(file: NgxFileDropEntry): string {
    return file.fileEntry.name.split('.').pop();
  }

  isAllowedFileExtension(file: NgxFileDropEntry): boolean {
    return this.allowedFileExtensions.includes(this.getFileExtension(file));
  }

  getNode(n, v) {
    n = document.createElementNS('http://www.w3.org/2000/svg', n);

    for (const p in v) {
      if (v.hasOwnProperty(p)) {
        n.setAttributeNS(null, p, v[p]);
      }
    }
    return n;
  }
}
