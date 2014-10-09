import os
import json
import jinja2
import logging
import webapp2
import uuid
from google.appengine.api import channel
from google.appengine.api import memcache
from google.appengine.ext import ndb


JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)))
SECRET = "fundamentals"
GROUP_ID = "1"

# ConnectedUsers is a simple table that stores the list of
# connected devices. It does not automatically clean itself
# out if stray devices are left.  The list is stored in
# memcache until a new user is added or deleted.
class ConnectedUsers(ndb.Model):
  client_id = ndb.StringProperty()

  @classmethod
  def get(cls):
    memcache_key = "connected_users"
    result = memcache.get(memcache_key)
    if result is None:
      result = []
      clients = cls.query()
      for client in clients:
        result.append(client.client_id)
      memcache.set(memcache_key, result)
    return result

  @classmethod
  def add(cls, client_id):
    client = ConnectedUsers(client_id = client_id)
    client.put()
    logging.info("Added %s", client_id)
    memcache.flush_all()

  @classmethod
  def remove(cls, client_id):
    client = cls.query(ConnectedUsers.client_id == client_id).get()
    client.key.delete()
    logging.info("Removed %s", client_id)
    memcache.flush_all()

# Serves the receiver page and creates a new channel for that page.
class ReceiverPage(webapp2.RequestHandler):
  def get(self):
    template_values = {}
    token = channel.create_channel(str(uuid.uuid1()), 1440)
    template_values["token"] = token
    template = JINJA_ENVIRONMENT.get_template("/static/client.html")
    self.response.write(template.render(template_values))

# API to send URLs to the list of connected devices. You must
# include the url, secret and correct group_id. Note, this
# request should always be sent over a secure channel to protect
# your secret and group_id. 
class SendAPI(webapp2.RequestHandler):
  def post(self):
    url = self.request.get('url')
    secret = self.request.get('secret')
    group_id = self.request.get('group_id')
    logging.info("URL Request")
    logging.info(" - URL: " + url)
    logging.info(" - secret: " + secret)
    logging.info(" - group_id: " + group_id)
    result = {}
    result["url"] = url
    if secret == SECRET and group_id == GROUP_ID:
      users = ConnectedUsers.get()
      count = 0
      for user in users:
        try:
          channel.send_message(user, url)
          count += 1
        except:
          pass
      result["clients"] = len(users)
      result["success"] = count
      result["error"] = False
      logging.info(" - clients: " + str(len(users)))
      logging.info(" - success: " + str(count))
      logging.info(" - sent: true")
    else:
      result["clients"] = 0
      result["success"] = 0
      result["error"] = True
      logging.info(" - sent: false")
    self.response.headers['Content-Type'] = "application/json"
    self.response.write(json.dumps(result))


# Adds a new device to the device list when the channel connects
class ChannelConnect(webapp2.RequestHandler):
  def post(self):
    client_id = self.request.get('from')
    ConnectedUsers.add(client_id)
    self.response.write("")


# Removes a device from the device list when a channel disconnects
class ChannelDisconnect(webapp2.RequestHandler):
  def post(self):
    client_id = self.request.get('from')
    ConnectedUsers.remove(client_id)
    self.response.write("")


# Serves the 404 page.
class NotFound(webapp2.RequestHandler):
  def post(self):
    self.sendResult()
  def get(self):
    self.sendResult()

  def sendResult(self):
    self.response.set_status(404)
    template_values = {}
    template = JINJA_ENVIRONMENT.get_template("/static/404.html")
    self.response.write(template.render(template_values))


application = webapp2.WSGIApplication([
    ('/wall', ReceiverPage),
    ('/wall/', ReceiverPage),
    ('/wall/send-api', SendAPI),
    ('/_ah/channel/connected/', ChannelConnect),
    ('/_ah/channel/disconnected/', ChannelDisconnect),
    ('/wall/.*', NotFound)
], debug=True)
