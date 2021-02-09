# cve-2017-5638
FROM tomcat:7

RUN set -ex \
	&& rm -rf /usr/local/tomcat/webapps/* \
	&& chmod a+x /usr/local/tomcat/bin/*.sh \
    && apt-get remove curl -y

COPY struts2-showcase-2.3.12.war /usr/local/tomcat/webapps/ROOT.war

RUN echo FLAG{STRUCT_WITH_SERIOUS_VULNERABILITY} > /flag.txt
RUN chmod -R 444 /flag.txt

RUN useradd -M -d /app user
USER user