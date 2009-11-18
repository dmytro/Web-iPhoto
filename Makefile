
INST_FILES = wiphoto/CSS wiphoto/images wiphoto/index.html wiphoto/js
INSTALL = install.zip

pkg: $(INST_FILES)
	zip -r $(INSTALL) -x@exclude.lst $(INST_FILES)