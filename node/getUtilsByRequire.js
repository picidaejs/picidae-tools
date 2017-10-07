var ID = 0;

function getUtilsByRequire(require) {
    var remark = require('remark');
    var remarkHtml = require('remark-html')
    var cheerio = require('cheerio');

    return {
        md2HTML: function (md, opt) {
            opt = Object.assign({slug: false}, opt);
            var uses = [remarkHtml];
            if (opt.slug) {
                uses.push(require('remark-slug'))
            }

            return new Promise(function (resolve, reject) {
                uses.reduce(function (remark, middle) {
                    return remark.use(middle)
                }, remark())
                    .process(md, function (err, file) {
                        if (err) {
                            console.error(err);
                            resolve();
                        }
                        else {
                            resolve(file.contents);
                        }
                    })
            })
        },
        md2Toc: function (md) {
            return this
                .md2HTML(md, {slug: true})
                .then(function (html) {
                    var id = 'cheerio-' + (ID++);
                    html = '<' + id + '>' + html + '</' + id + '>'
                    var dom = cheerio.load(html)(id);
                    // console.log(html, dom.html())
                    var toc = [], par = null
                    dom.children(':header').map(function () {
                        var self = cheerio(this);
                        var tagName = self.prop('tagName');
                        var dep = Number(tagName.replace(/^h/i, ''));
                        var id = self.attr('id');
                        var val = self.html();
                        var node = {dep: dep, id: id, val: val};

                        if (par) {
                            if (par.dep < dep) {
                                par.node.children = par.node.children || [];
                                par.node.children.push(node);
                                par = Object.assign({node: node, par: par, dep: node.dep});
                            }
                            else {
                                // if (par.par) {
                                while (par && par.dep >= dep) {
                                    par = par.par;
                                }
                                if (par) {
                                    par.node.children = par.node.children || [];
                                    par.node.children.push(node);
                                    par = Object.assign({node: node, par: par, dep: node.dep});
                                }
                                else {
                                    toc.push(node);
                                    par = {node: node, dep: node.dep};
                                }

                                // }
                                // else {
                                //   toc.push(node);
                                //   par = {node: node, dep: node.dep};
                                // }
                                // }
                            }
                        }
                        else {
                            toc.push(node);
                            par = {node: node, dep: node.dep};
                        }
                    })

                    return toc;
                }).catch(console.error)
        }
    }
}


module.exports = getUtilsByRequire;
